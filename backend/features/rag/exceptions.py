class InvalidDocumentError(Exception):
    pass

class DocumentProcessingError(Exception):
    def __init__(self, doc: str):
        self.doc = doc
    
class DocumentNotFoundError(Exception):
    def __init__(self, doc_id: str):
        self.doc_id = doc_id