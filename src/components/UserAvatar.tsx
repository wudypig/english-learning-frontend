import React from 'react';

interface UserAvatarProps {
    user: {
        nickname?: string | null;
        email: string;
        avatar?: string | null;
    };
    size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-16 h-16 text-xl'
    };

    const getInitials = () => {
        if (user.nickname) {
            return user.nickname.charAt(0).toUpperCase();
        }
        return user.email.charAt(0).toUpperCase();
    };

    if (user.avatar) {
        return (
            <img
                src={user.avatar}
                alt={user.nickname || user.email}
                className={`${sizeClasses[size]} rounded-full object-cover`}
            />
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-full gradient-bg-purple flex items-center justify-center text-white font-bold shadow-lg`}>
            {getInitials()}
        </div>
    );
};

export default UserAvatar;
