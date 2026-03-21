<?php

namespace App\Http\Controllers\Api;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "Resultados River API Documentation",
    description: "API for managing and querying historical football results for River Plate.",
    contact: new OA\Contact(email: "admin@example.com"),
    license: new OA\License(name: "Apache 2.0", url: "http://www.apache.org/licenses/LICENSE-2.0.html")
)]
#[OA\Server(
    url: "http://localhost:8000/api",
    description: "Main API Server"
)]
#[OA\SecurityScheme(
    securityScheme: "sanctum",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Use a Sanctum token to authenticate",
    name: "Authorization",
    in: "header"
)]
class OpenApi
{
}
