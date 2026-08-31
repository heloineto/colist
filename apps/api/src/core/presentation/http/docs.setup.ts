import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export function setupDocs(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Colist API')
    .setDescription('Shared shopping lists')
    .setVersion('1.0')
    .setOpenAPIVersion('3.1.0')
    .build();

  const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));

  SwaggerModule.setup('api/swagger', app, document, {
    swaggerUiEnabled: false,
    jsonDocumentUrl: 'api/openapi/json',
    yamlDocumentUrl: 'api/openapi/yaml',
  });

  app.use(
    '/api/docs',
    apiReference({
      content: document,
      title: 'Colist API',
      hideClientButton: true,
      hiddenClients: true,
    })
  );
}
