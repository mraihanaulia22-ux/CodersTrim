from fastapi import APIRouter

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/")
def get_items():
    return [{"id": 1, "name": "Item Alpha"}, {"id": 2, "name": "Item Beta"}]
