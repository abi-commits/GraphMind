from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router as api_router
from src.config.settings import settings


def create_app() -> FastAPI:
	app = FastAPI(title="GraphMind API", version="0.1.0")
	
	# Add CORS middleware
	app.add_middleware(
		CORSMiddleware,
		allow_origins=settings.CORS_ORIGINS,
		allow_credentials=True,
		allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allow_headers=["*"],
	)
	
	app.include_router(api_router, prefix=settings.API_PREFIX)
	return app


app = create_app()


@app.get("/")
async def root():
	return {"name": settings.APP_NAME, "status": "ok", "api": settings.API_PREFIX}

