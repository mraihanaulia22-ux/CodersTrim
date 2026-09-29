package models

type HealthResponse struct {
	Status    string `json:"status"`
	App       string `json:"app"`
	Framework string `json:"framework"`
}
