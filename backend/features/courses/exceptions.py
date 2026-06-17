class CourseNotFoundError(Exception):
    def __init__(self, course_ids: list[str]):
        self.course_ids = course_ids