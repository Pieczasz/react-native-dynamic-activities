module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          verbatimModuleSyntax: false,
          esModuleInterop: true,
        },
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/index.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "node",
  transformIgnorePatterns: [
    "node_modules/(?!(@react-native|react-native|react-native-nitro-modules)/)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/lib/", "/dist/"],
};
