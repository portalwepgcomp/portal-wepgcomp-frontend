import nextJest from 'next/jest.js';

// Fixa o fuso da suíte: a derivação de dias do evento depende do offset local,
// e em UTC os testes de data passariam mesmo com a regressão de volta.
process.env.TZ = 'America/Bahia';

const createJestConfig = nextJest({
  // Carrega automaticamente next.config.js e arquivos .env no ambiente de testes
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default createJestConfig(config);
