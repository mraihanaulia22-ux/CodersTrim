package handlers

import (
	"coderstrim_app/models"
	"github.com/gofiber/fiber/v2"
)

func GetUsers(c *fiber.Ctx) error {
	users := []models.User{
		{ID: 1, Name: "Demo User", Role: "Developer"},
	}
	return c.JSON(users)
}
