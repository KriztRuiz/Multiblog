// backend/src/docs/openapi.ts
// OpenAPI 3.0.3 spec para Multiblog (Express + Prisma)

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Multiblog API",
    version: "1.0.0",
    description:
      "API de red social de blogs: autenticación, posts, likes y comentarios.\n\n" +
      "Endpoints con JWT usan el esquema Bearer.",
  },
  servers: [
    { url: "http://localhost:5000", description: "Local" },
  ],
  tags: [
    { name: "Auth" },
    { name: "Posts" },
    { name: "Comments" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Id: { type: "string", example: "cmf4cbpvm000013vchgc0t7s9" },

      User: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Id" },
          name: { type: "string", example: "Juan Pérez" },
          email: { type: "string", format: "email", example: "abogado@example.com" },
        },
        required: ["id", "name", "email"],
      },

      PostBase: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Id" },
          title: { type: "string", example: "Experiencia legal de hoy" },
          content: { type: "string", example: "Hoy representé a un cliente..." },
          likes: { type: "integer", example: 2 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time", nullable: true },
          authorId: { $ref: "#/components/schemas/Id" },
        },
        required: ["id", "title", "content", "likes", "createdAt", "authorId"],
      },

      Post: {
        allOf: [
          { $ref: "#/components/schemas/PostBase" },
          {
            type: "object",
            properties: {
              author: { $ref: "#/components/schemas/User" },
            },
          },
        ],
      },

      PostWithLikedByMe: {
        allOf: [
          { $ref: "#/components/schemas/Post" },
          {
            type: "object",
            properties: { likedByMe: { type: "boolean", example: true } },
          },
        ],
      },

      Comment: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Id" },
          content: { type: "string", example: "¡Gracias por la recomendación!" },
          createdAt: { type: "string", format: "date-time" },
          postId: { $ref: "#/components/schemas/Id" },
          authorId: { $ref: "#/components/schemas/Id" },
          author: {
            type: "object",
            properties: {
              id: { $ref: "#/components/schemas/Id" },
              name: { type: "string" },
            },
          },
        },
        required: ["id", "content", "createdAt", "postId", "authorId"],
      },

      Meta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 3 },
          pages: { type: "integer", example: 1 },
          hasNext: { type: "boolean", example: false },
          hasPrev: { type: "boolean", example: false },
          sort: { type: "string", example: "new" },
          q: { type: "string", nullable: true },
          authorId: { type: "string", nullable: true },
          minLikes: { type: "integer", nullable: true },
          dateFrom: { type: "string", format: "date-time", nullable: true },
          dateTo: { type: "string", format: "date-time", nullable: true },
        },
        required: ["page", "limit", "total", "pages", "hasNext", "hasPrev"],
      },

      PaginatedPosts: {
        type: "object",
        properties: {
          meta: { $ref: "#/components/schemas/Meta" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/PostWithLikedByMe" },
          },
        },
        required: ["meta", "data"],
      },

      PaginatedComments: {
        type: "object",
        properties: {
          meta: { $ref: "#/components/schemas/Meta" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Comment" },
          },
        },
        required: ["meta", "data"],
      },

      AuthLoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "maestro@example.com" },
          password: { type: "string", example: "maestro123" },
        },
        required: ["email", "password"],
      },

      AuthLoginResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOi..." },
          user: { $ref: "#/components/schemas/User" },
        },
        required: ["token", "user"],
      },

      RegisterRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Ana" },
          email: { type: "string", format: "email", example: "ana@example.com" },
          password: { type: "string", example: "secret123" },
        },
        required: ["name", "email", "password"],
      },

      CreatePostRequest: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
        },
        required: ["title", "content"],
      },

      UpdatePostRequest: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
        },
      },

      CreateCommentRequest: {
        type: "object",
        properties: {
          content: { type: "string" },
        },
        required: ["content"],
      },

      Error: {
        type: "object",
        properties: { message: { type: "string", example: "Not found" } },
        required: ["message"],
      },
    },
  },

  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } },
          },
        },
        responses: {
          "201": { description: "Creado", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Email en uso", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/AuthLoginRequest" } },
          },
        },
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthLoginResponse" } } } },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/posts": {
      get: {
        tags: ["Posts"],
        summary: "Listar posts (paginación / búsqueda / filtros / orden)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50 } },
          { name: "q", in: "query", schema: { type: "string" }, description: "Texto en título, contenido o autor" },
          { name: "sort", in: "query", schema: { type: "string", enum: ["new", "old", "likes"] } },
          { name: "authorId", in: "query", schema: { type: "string" } },
          { name: "minLikes", in: "query", schema: { type: "integer", minimum: 0 } },
          { name: "dateFrom", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "dateTo", in: "query", schema: { type: "string", format: "date-time" } },
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedPosts" } } } },
        },
      },

      post: {
        tags: ["Posts"],
        summary: "Crear post",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreatePostRequest" } },
          },
        },
        responses: {
          "201": { description: "Creado", content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/posts/{id}": {
      get: {
        tags: ["Posts"],
        summary: "Obtener un post",
        parameters: [{ name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/Id" } }],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/PostWithLikedByMe" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Posts"],
        summary: "Actualizar post (autor)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/Id" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdatePostRequest" } } } },
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Eliminar post (autor)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/Id" } }],
        responses: {
          "204": { description: "No Content" },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/posts/{id}/like": {
      post: {
        tags: ["Posts"],
        summary: "Dar like",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/Id" } }],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Already liked", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Quitar like",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { $ref: "#/components/schemas/Id" } }],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Not liked", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/posts/{postId}/comments": {
      get: {
        tags: ["Comments"],
        summary: "Listar comentarios de un post",
        parameters: [
          { name: "postId", in: "path", required: true, schema: { $ref: "#/components/schemas/Id" } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50 } },
          { name: "sort", in: "query", schema: { type: "string", enum: ["new", "old"] } },
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedComments" } } } },
        },
      },
      post: {
        tags: ["Comments"],
        summary: "Crear comentario",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "postId", in: "path", required: true, schema: { $ref: "#/components/schemas/Id" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateCommentRequest" } },
          },
        },
        responses: {
          "201": { description: "Creado", content: { "application/json": { schema: { $ref: "#/components/schemas/Comment" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Post not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/posts/{postId}/comments/{commentId}": {
      get: {
        tags: ["Comments"],
        summary: "Detalle de comentario",
        parameters: [
          { name: "postId", in: "path", required: true, schema: { $ref: "#/components/schemas/Id" } },
          { name: "commentId", in: "path", required: true, schema: { $ref: "#/components/schemas/Id" } },
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Comment" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Comments"],
        summary: "Eliminar comentario (autor)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "postId", in: "path", required: true, schema: { $ref: "#/components/schemas/Id" } },
          { name: "commentId", in: "path", required: true, schema: { $ref: "#/components/schemas/Id" } },
        ],
        responses: {
          "204": { description: "No Content" },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
  },
};
