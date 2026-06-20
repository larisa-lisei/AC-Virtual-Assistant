from bson import ObjectId
from bson.errors import InvalidId

from .exceptions import InvalidIdError

# mongo id
def validate_id(id: str): 
    try: 
        ObjectId(id) 
    except InvalidId: 
        raise InvalidIdError(id)