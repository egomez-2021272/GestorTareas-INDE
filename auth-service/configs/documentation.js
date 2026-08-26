import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'INDE-Tasks API',
            version: '1.0.0',
            description: 'Documentación del servicio de autenticación y usuarios de INDE-Tasks.'
        },
        servers: [
            {
                url: 'http://localhost:3000', 
                description: 'Servidor local'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }],
        tags: [
            {
                name: 'Auth',
                description: 'Autenticación y gestión de usuarios'
            }
        ]
    },

   
    apis: [
        './src/user.routes.js'
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };