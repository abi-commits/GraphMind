from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from src.api.routes import router as api_router
from src.config.settings import settings
import os

def create_app() -> FastAPI:
    app = FastAPI(
        title="GraphMind API",
        version="0.1.0",
        description="API for GraphMind, a tool for visualizing knowledge graphs.",
        contact={
            "name": "Abinesh",
            "email": "abinesh.ai.ml@gmail.com",
        },
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # Include the API router
    app.include_router(api_router, prefix=settings.API_PREFIX)

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
