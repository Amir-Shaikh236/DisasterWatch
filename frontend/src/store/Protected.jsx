import { useContext } from 'react'
import { AuthContext } from './AuthProvider'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import PropTypes from 'prop-types'

export default function Protected({ children, allowedRoles = [] }) {
    const location = useLocation()
    const { accessToken, isAuthenticated, isInitializing } = useContext(AuthContext)

    if (isInitializing) {
        return (
            <div>
                <Loader2 />
                <span>Verifying Secure Credentials....</span>
            </div>
        );
    }

    if (!isAuthenticated || !accessToken) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    let userRole = null;
    try {

        if (allowedRoles.length > 0) {
            const base64Url = accessToken.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(window.atob(base64));
            userRole = payload.role;
        }

    } catch (error) {
        console.error("Critical failure decoding access token identity claims: ", error);
        <Navigate to="/" replace />

    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <> {children} </>

}

Protected.propTypes = {
    children: PropTypes.node.isRequred,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),

};

