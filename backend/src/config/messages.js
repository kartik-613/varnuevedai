/**
 * Centralized Messages File
 * Contains all static message strings used in the API
 */
const MSG = {
    CRUD: {
        OK: 'Success',
        CREATED: 'Resource created successfully',
        UPDATED: 'Resource updated successfully',
        PATCHED: 'Resource partially updated successfully',
        DELETED: 'Resource soft-deleted successfully',
        PERMANENT_DELETED: 'Resource permanently deleted',
        RESTORED: 'Resource restored successfully',
        NOT_FOUND: 'Resource not found',
        VALIDATION_FAILED: 'Validation failed',
        BULK_CREATED: (count) => `Successfully created ${count} resources`,
        BULK_DELETED: (count) => `Successfully deleted ${count} resources`,
        MODEL_NOT_FOUND: (model) => `Database model "${model}" not found`
    },
    AUTH: {
        UNAUTHORIZED: 'You are not authorized to perform this action',
        FORBIDDEN: 'Action forbidden for your role',
        LOGIN_SUCCESS: 'Logged in successfully',
        LOGIN_FAILED: 'Invalid credentials',
        USER_NOT_FOUND: 'User account not found',
        LOGOUT: 'Logged out successfully'
    },
    SERVER: {
        STARTED: (port) => `Server running on port ${port}`,
        INTERNAL_ERROR: 'Something went wrong. Please try again later.'
    }
};

export default MSG;
