import { createContext, useContext, useState, type ReactNode } from 'react';

interface AdminContextType {
    isAdminMode: boolean;
    toggleAdminMode: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const [isAdminMode, setIsAdminMode] = useState(false);

    const toggleAdminMode = () => {
        setIsAdminMode(prev => !prev);
    };

    return (
        <AdminContext.Provider value={{ isAdminMode, toggleAdminMode }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within AdminProvider');
    }
    return context;
};
