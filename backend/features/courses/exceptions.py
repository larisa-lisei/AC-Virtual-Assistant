class CourseNotFoundError(Exception):
    def __init__(self, course_ids: list[str]):
        self.course_ids = course_ids

class CourseAccessDeniedError(Exception):
    def __str__(self):
        return "You are not allowed to access this course."
