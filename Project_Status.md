# Project Status and Development Guidelines

## Project Overview
AgriGrow Finance is a platform connecting microfinance institutions (MFIs) with smallholder farmers in Nigeria, providing harvest-cycle-aligned loans with AI-powered risk assessment.

## Current Status
- Core functionality implemented
- Type system centralization completed
- API integrations with Appwrite established
- Weather and crop data services operational
- UI components using shadcn/ui library
- Loan application workflow completed
- Farmer dashboard with calendar functionality implemented
- Form validation and error handling improved
- Risk assessment explanation and visualization implemented
- Error handling updated for Vercel deployment compliance

## Development Guidelines

### Type System
- All types must be defined in the `/types` directory
- Types should be organized by domain (farmer.ts, loan.ts, agricultural.ts)
- Export all types through index.ts
- No duplicate type definitions across files
- Always export interfaces used across multiple files

### Code Quality
- **No undefined types**: Never use `(error)` as a catch block of a try statement or any other error emitting component in code
- **Always define error types**: All catch blocks must use `(error: unknown)` and properly type-check the error
- **Error handling pattern**: Always follow this pattern:
  ```typescript
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Default error message';
    console.error("Descriptive context:", errorMessage);
    // Additional error handling as needed
  }
  ```
- **No unused variables**: All declared variables must be used or prefixed with underscore
- **Proper error handling**: Include try/catch blocks for async operations
- **Type safety**: Use proper TypeScript types for all variables and function parameters
- **⚠️ WARNING: No unused state variables**: Don't declare state variables (useState) without using them in the component. If you declare `setIsLoading`, you must use it in the UI (e.g., showing a loading indicator). Unused state variables cause errors during Vercel deployment.

### Vercel Deployment Compliance
- **Client Components**: Add 'use client' directive to components using hooks
- **Suspense Boundaries**: Wrap components using `useSearchParams()` in Suspense
- **Environment Variables**: Always provide fallbacks for environment variables
- **API Routes**: Follow Next.js API route patterns for server-side functions
- **Build Optimization**: Keep bundle sizes small by avoiding unnecessary dependencies
- **State Management**: Ensure all React state variables are properly used in the component

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
- Risk assessment algorithm
- Repayment scheduling
- Weather and crop data integration
- Loan application display in farmer dashboard

## Recent Improvements
- Fixed loan application submission process
- Implemented farming calendar with modal view
- Improved form validation for pre-filled fields
- Enhanced error handling for Appwrite database operations
- Fixed data fetching in dashboard to properly display loan applications
- Implemented risk explanation display in loan details
- Updated error handling to use proper TypeScript typing
- Fixed type issues for Vercel deployment
- Added warning about unused state variables causing Vercel deployment errors

## LLM Guidelines
1. **Preserve Working Functionality**: Do not modify working code unless specifically requested
2. **Type Safety**: Ensure all code is properly typed
3. **Error Prevention**: Avoid common Vercel deployment issues:
   - No undefined variables
   - No missing dependencies
   - No client-side operations in server components
   - No unused state variables (if you declare useState, use it in the UI)
4. **Code Style**: Follow the established patterns in the codebase
5. **Documentation**: Add comments for complex logic

## Next Steps
1. Implement remaining API integrations
2. Enhance risk assessment algorithm
3. Improve mobile responsiveness
4. Add comprehensive testing
5. Implement notification system for loan status updates
6. Add data visualization for farm performance metrics
7. Enhance MFI dashboard with more detailed analytics

## Dependencies to Install
- For calendar functionality: `npx shadcn-ui@latest add calendar`
