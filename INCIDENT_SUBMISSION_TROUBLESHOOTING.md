# Incident Submission Troubleshooting Guide

## Problem
Users are experiencing "Failed to submit incident" errors when trying to report incidents in the Safe Campus app.

## Root Causes Identified

### 1. RLS (Row Level Security) Policy Issues
- Complex, circular RLS policies that may be blocking incident creation
- Missing or overly restrictive INSERT policies for the incidents table
- Authentication context not properly passed to RLS policies

### 2. Authentication State Issues
- User object may not be properly authenticated when submitting
- Auth context may be stale or expired
- User ID mismatch between auth context and incident data

### 3. Database Schema Mismatches
- Data validation issues between frontend and database
- Missing required fields or incorrect data types
- Constraint violations

## Solutions Implemented

### 1. Enhanced Error Handling & Logging
- Added comprehensive logging throughout the incident submission flow
- Specific error messages for different failure scenarios
- Better debugging information in console logs

### 2. Improved Data Validation
- Pre-submission validation of user authentication
- Data cleaning and normalization before database insertion
- Required field validation

### 3. RLS Policy Fixes
- Simplified, non-circular RLS policies
- Explicit INSERT policy for incident creation
- Proper authentication checks in policies

### 4. Debug Utilities
- Comprehensive diagnostic tools
- Authentication status checking
- Database access testing
- RLS policy verification

## Step-by-Step Resolution

### Step 1: Run the RLS Policy Fix
Execute the SQL in `fix-incident-submission-rls.sql` in your Supabase SQL Editor:

```sql
-- This will fix the RLS policies that are blocking incident creation
-- Run the entire file in your Supabase SQL Editor
```

### Step 2: Test the Debug Utilities
1. Open the Report Incident screen
2. Tap the "Debug Incident Submission" button (gold button)
3. Review the debug results in the alert
4. Check console logs for detailed information

### Step 3: Verify Authentication
Ensure the user is properly logged in:
- Check that `user.id` exists in the AuthContext
- Verify the user exists in the `users` table
- Confirm the authentication token is valid

### Step 4: Check Database Access
The debug utilities will test:
- SELECT access to incidents table
- INSERT access to incidents table
- RLS policy configuration

## Common Error Codes & Solutions

### Error Code: 42501 (Permission Denied)
**Cause**: RLS policy blocking the operation
**Solution**: Run the RLS policy fix SQL

### Error Code: 23503 (Foreign Key Violation)
**Cause**: User ID doesn't exist in users table
**Solution**: Ensure user profile is created after signup

### Error Code: 23505 (Unique Constraint Violation)
**Cause**: Duplicate incident submission
**Solution**: Check for duplicate data or implement deduplication

### Error Code: 42P01 (Table Not Found)
**Cause**: Database table doesn't exist
**Solution**: Run the complete database schema setup

## Testing the Fix

1. **Clear app data** and log in again
2. **Try to submit a simple incident** (select type, add description, location)
3. **Check console logs** for detailed submission flow
4. **Use debug button** to verify all systems are working
5. **Submit incident** and verify success

## Monitoring & Prevention

### Add to Production
- Remove debug button and utilities
- Implement proper error tracking (e.g., Sentry)
- Add user feedback for common errors
- Monitor incident submission success rates

### Regular Maintenance
- Review RLS policies quarterly
- Monitor database performance
- Check authentication flow regularly
- Validate user permissions

## Files Modified

- `src/services/incidentService.js` - Enhanced error handling and logging
- `src/screens/ReportIncidentScreen/index.js` - Improved validation and debug tools
- `src/utils/debugUtils.js` - New debugging utilities
- `fix-incident-submission-rls.sql` - RLS policy fixes
- `INCIDENT_SUBMISSION_TROUBLESHOOTING.md` - This guide

## Next Steps

1. **Immediate**: Run the RLS policy fix SQL
2. **Short-term**: Test with debug utilities
3. **Medium-term**: Monitor incident submission success
4. **Long-term**: Implement comprehensive error tracking

## Support

If issues persist after implementing these fixes:
1. Check Supabase logs for detailed error information
2. Verify RLS policies are correctly applied
3. Test database access directly via Supabase dashboard
4. Review authentication flow and user state management 