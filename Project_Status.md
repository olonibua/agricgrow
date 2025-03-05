# Project Status and Development Guidelines

## Project Overview
AgriGrow Finance is a platform connecting microfinance institutions (MFIs) with smallholder farmers in Nigeria, providing harvest-cycle-aligned loans with AI-powered risk assessment.

## Current Status
- Core functionality implemented
- Type system centralization in progress
- API integrations with Appwrite established
- Weather and crop data services operational
- UI components using shadcn/ui library

## Development Guidelines

### Type System
- All types must be defined in the `/types` directory
- Types should be organized by domain (farmer.ts, loan.ts, agricultural.ts)
- Export all types through index.ts
- No duplicate type definitions across files
- Always export interfaces used across multiple files

### Code Quality
- **No undefined types**: Never use `(error)` as a placeholder in code
- **No unused variables**: All declared variables must be used or prefixed with underscore
- **Proper error handling**: Include try/catch blocks for async operations
- **Type safety**: Use proper TypeScript types for all variables and function parameters

### Vercel Deployment Compliance
- **Client Components**: Add 'use client' directive to components using hooks
- **Suspense Boundaries**: Wrap components using `useSearchParams()` in Suspense
- **Environment Variables**: Always provide fallbacks for environment variables
- **API Routes**: Follow Next.js API route patterns for server-side functions
- **Build Optimization**: Keep bundle sizes small by avoiding unnecessary dependencies

### Data Handling
- Use proper data fetching patterns (SWR or React Query preferred)
- Implement proper loading states for all data fetching operations
- Cache frequently accessed data where appropriate

### UI/UX Guidelines
- Follow the established design system using shadcn/ui components
- Ensure all forms have proper validation
- Provide clear feedback for all user actions
- Ensure responsive design for mobile users

### API Integration
- Use the established Appwrite client pattern for all database operations
- Properly handle authentication and authorization
- Follow the established error handling pattern

## Critical Areas
- Loan application workflow
- Risk assessment algorithm
- Repayment scheduling
- Weather and crop data integration

## LLM Guidelines
1. **Preserve Working Functionality**: Do not modify working code unless specifically requested
2. **Type Safety**: Ensure all code is properly typed
3. **Error Prevention**: Avoid common Vercel deployment issues:
   - No undefined variables
   - No missing dependencies
   - No client-side operations in server components
4. **Code Style**: Follow the established patterns in the codebase
5. **Documentation**: Add comments for complex logic

## Next Steps
1. Complete type centralization
2. Implement remaining API integrations
3. Enhance risk assessment algorithm
4. Improve mobile responsiveness
5. Add comprehensive testing
