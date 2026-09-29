package handlers

import (
	"coderstrim_app/models"
	"github.com/gofiber/fiber/v2"
)

func HealthCheck(c *fiber.Ctx) error {
	return c.JSON(models.HealthResponse{
		Status:    "healthy",
		App:       "__CT_PROJECT_NAME__",
		Framework: "Go Fiber v2",
	})
}
