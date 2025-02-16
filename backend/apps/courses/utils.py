import pandas as pd
import pdfplumber
from typing import List, Dict, Any, Tuple
import re
from datetime import datetime, time


class FileParser:
    """文件解析器基类"""

    def parse(self, file) -> List[Dict[str, Any]]:
        raise NotImplementedError


class PDFParser(FileParser):
    """PDF文件解析器"""

    def parse(self, file) -> List[Dict[str, Any]]:
        courses = []
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                # 使用正则表达式匹配课程信息
                # 格式：开课学院,课程名称,课程性质,教学班名称,课程号,学分,任课教师,课堂容量,已选人数,上课时间,教学地点
                pattern = r"([^,]+),([^,]+),([^,]+),\([^)]+\),(\d+),(\d+\.?\d*),([^,]+),(\d+),(\d+),([^,]+),([^,]+)"
                matches = re.finditer(pattern, text)

                for match in matches:
                    # 处理教学地点，可能有多个地点用分号分隔
                    classroom = match.group(10).strip()
                    if ";" in classroom:
                        classroom = classroom.split(";")[0]  # 取第一个教室

                    # 处理上课时间
                    time_slot = match.group(9).strip()
                    if "{" in time_slot:
                        # 将时间格式标准化，例如：
                        # "星期四第4-5节{1-16周}" -> "周四 4-5节"
                        time_slot = time_slot.replace("星期", "周")
                        time_slot = time_slot.split("{")[0].strip()

                    # 从时间字符串中提取起始结束周
                    weeks_match = re.search(r"{(\d+)-(\d+)周}", match.group(9))
                    if weeks_match:
                        start_week = int(weeks_match.group(1))
                        end_week = int(weeks_match.group(2))
                    else:
                        start_week = 1
                        end_week = 16

                    course = {
                        "name": match.group(2).strip(),
                        "course_code": match.group(4).strip(),
                        "teacher": match.group(6).strip(),
                        "classroom": classroom,
                        "capacity": int(match.group(7)),
                        "selected_count": int(match.group(8)),
                        "time_slot": time_slot,
                        "description": f"{match.group(3).strip()} - {match.group(1).strip()} - {match.group(5)}学分",
                        "start_week": start_week,
                        "end_week": end_week,
                    }
                    courses.append(course)

        return courses


class CSVParser(FileParser):
    """CSV文件解析器"""

    def parse(self, file) -> List[Dict[str, Any]]:
        df = pd.read_csv(file, encoding="utf-8")

        # 验证所需列是否存在
        required_columns = [
            "课程名称",
            "课程号",
            "任课教师",
            "教学地点",
            "课堂容量",
            "已选人数",
            "上课时间",
            "课程性质",
            "学分",
            "开课学院",
            "起始结束周",
        ]

        # 验证所需列是否存在
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"CSV文件缺少必要的列：{', '.join(missing_columns)}")

        # 转换为课程数据列表
        courses = []
        for _, row in df.iterrows():
            # 跳过没有课程号的行
            if pd.isna(row["课程号"]):
                continue

            # 处理教学地点，可能有多个地点用分号分隔
            classroom = row["教学地点"]
            if pd.isna(classroom):
                classroom = "待定"
            elif ";" in str(classroom):
                classroom = classroom.split(";")[0]  # 取第一个教室

            # 处理上课时间
            time_slot = row["上课时间"]
            if pd.isna(time_slot):
                time_slot = "待定"
            else:
                # 将时间格式标准化，例如：
                # "星期四第4-5节{1-16周}" -> "周四 4-5节"
                time_slot = time_slot.replace("星期", "周")
                time_slot = time_slot.split("{")[0].strip()

            # 处理起始结束周
            weeks = row["起始结束周"]
            if not pd.isna(weeks):
                if "周" in weeks:
                    weeks = weeks.replace("周", "")
                try:
                    start_week, end_week = map(int, weeks.split("-"))
                except:
                    start_week, end_week = 1, 16
            else:
                start_week, end_week = 1, 16

            course = {
                "name": row["课程名称"],
                "course_code": str(row["课程号"]),
                "teacher": row["任课教师"],
                "classroom": classroom,
                "capacity": int(row["课堂容量"]) if not pd.isna(row["课堂容量"]) else 0,
                "selected_count": int(row["已选人数"])
                if not pd.isna(row["已选人数"])
                else 0,
                "time_slot": time_slot,
                "description": f"{row['课程性质']} - {row['开课学院']} - {row['学分']}学分",
                "start_week": start_week,
                "end_week": end_week,
            }
            courses.append(course)

        return courses


def get_parser(file_type: str) -> FileParser:
    """获取对应的解析器"""
    parsers = {"pdf": PDFParser(), "csv": CSVParser()}
    return parsers.get(file_type.lower())


class TimeSlot:
    """课程时间段类"""

    def __init__(self, day: int, start: time, end: time):
        self.day = day
        self.start = start
        self.end = end

    @classmethod
    def parse(cls, time_slot: str) -> List["TimeSlot"]:
        """
        解析时间字符串为TimeSlot对象列表
        示例格式：
        "周一 1-2节, 周三 3-4节" -> [TimeSlot(1, 08:00, 09:40), TimeSlot(3, 10:00, 11:40)]
        """
        time_slots = []
        # 时间映射表（节次到具体时间的映射）
        class_time_map = {
            1: (time(8, 0), time(9, 40)),
            3: (time(10, 0), time(11, 40)),
            5: (time(14, 0), time(15, 40)),
            7: (time(16, 0), time(17, 40)),
            9: (time(19, 0), time(20, 40)),
        }
        # 星期映射表
        day_map = {"一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "日": 7}

        # 分割多个时间段
        slots = time_slot.split(",")
        for slot in slots:
            slot = slot.strip()
            # 解析星期和节次
            match = re.match(r"周([\u4e00-\u9fa5])\s*(\d+)-(\d+)节", slot)
            if match:
                day = day_map.get(match.group(1))
                start_class = int(match.group(2))
                end_class = int(match.group(3))

                if start_class in class_time_map:
                    start_time = class_time_map[start_class][0]
                    # 获取结束时间
                    if end_class > start_class and start_class + 1 in class_time_map:
                        end_time = class_time_map[start_class + 1][1]
                    else:
                        end_time = class_time_map[start_class][1]

                    time_slots.append(cls(day, start_time, end_time))

        return time_slots

    def overlaps(self, other: "TimeSlot") -> bool:
        """检查两个时间段是否重叠"""
        if self.day != other.day:
            return False
        return self.start < other.end and self.end > other.start


class ConflictChecker:
    """课程冲突检测器"""

    @staticmethod
    def check_conflicts(course1_time: str, course2_time: str) -> Tuple[bool, str]:
        """
        检查两门课程是否存在时间冲突
        返回值: (是否冲突, 冲突描述)
        """
        try:
            slots1 = TimeSlot.parse(course1_time)
            slots2 = TimeSlot.parse(course2_time)

            for slot1 in slots1:
                for slot2 in slots2:
                    if slot1.overlaps(slot2):
                        return (
                            True,
                            f"课程时间冲突：周{slot1.day} {slot1.start.strftime('%H:%M')}-{slot1.end.strftime('%H:%M')}",
                        )

            return False, ""
        except Exception as e:
            return False, f"时间格式解析错误: {str(e)}"
