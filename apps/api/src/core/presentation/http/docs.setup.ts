import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export class DocsSetup {
  static setup(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('Colist API')
      .setDescription('Shared shopping lists')
      .setVersion('1.0')
      .build();

    const document = cleanupOpenApiDoc(
      SwaggerModule.createDocument(app, config)
    );

    SwaggerModule.setup('swagger', app, document, {
      swaggerUiEnabled: false,
      jsonDocumentUrl: 'openapi/json',
      yamlDocumentUrl: 'openapi/yaml',
    });

    app.use(
      '/docs',
      apiReference({
        content: document,
        title: 'Colist API',
        hideClientButton: true,
        hiddenClients: true,
      })
    );
  }
}
