class InvalidDocumentError(Exception):
    pass

class DocumentProcessingError(Exception):
    def __init__(self, doc: str):
        self.doc = doc

class NoRelevantDocsError(Exception):
    def __str__(self):
        return "No relevant course materials were found for this question."