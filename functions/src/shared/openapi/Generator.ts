import fs from 'node:fs'
import path from 'node:path'
import { OpenAPIRegistry, OpenApiGeneratorV31, type RouteConfig } from '@asteasolutions/zod-to-openapi'
import { allSpecs } from '@mimi-api/contexts/common/controllers/AllControllersSpecs'
import { IOpenApiSpec } from '@mimi-api/shared/openapi/IOpenApiSpec'

const convertToRouteConfig = (spec: IOpenApiSpec): RouteConfig => {
  return {
    method: spec.method,
    path: spec.path,
    description: spec.description,
    request: spec.request,
    responses: spec.responses,
    tags: spec.tags ? [...spec.tags] : undefined,
  }
}

function defineRoutes() {
  const registry = new OpenAPIRegistry()
  for (const spec of allSpecs) {
    registry.registerPath(convertToRouteConfig(spec))
  }
  return registry
}

function generateOpenapi(registry: OpenAPIRegistry) {
  const generator = new OpenApiGeneratorV31(registry.definitions)

  const openApiDocument = generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Mimi API',
      version: '1.0.0',
    },
  })

  fs.writeFileSync(path.join(__dirname, './openapi.json'), JSON.stringify(openApiDocument, null, 2))

  console.log('OpenAPI schema generated successfully!')
}

const registryWithRoutes = defineRoutes()
generateOpenapi(registryWithRoutes)
