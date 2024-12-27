import React, { useState, useEffect } from 'react';
import { Avatar } from '@mui/material';
import { useAuth } from '../Contexts/useHook';

const ProfileImage = ({ name, userImage, index }) => {
    const { user } = useAuth();
    const api_url = import.meta.env.VITE_REACT_APP_API_URL;
    const image_path = import.meta.env.VITE_REACT_IMAGE_PATH;
    const [imageSrc, setImageSrc] = useState(null);
    let avatarSize = index < 0 ? { width: 55, height: 55 } : { width: 40, height: 40 };
    const imageSize = { width: avatarSize.width - 3, height: avatarSize.height - 3 };
    const avatarSrc = userImage ? `${api_url}${image_path}${userImage}` : `avatar${index + 1}.jpg`;

    useEffect(() => {
        const loadImage = async () => {
            try {
                const response = await fetch(avatarSrc);
                if (response.status === 400) {
                    setLoading(false);
                    navigate("/500");
                    return;
                }
                if (response.ok) {
                    const blob = await response.blob();
                    if (blob.size > 0) {
                        setImageSrc(URL.createObjectURL(blob));
                    } else {
                        setImageSrc(null);
                    }
                } else {
                    setImageSrc(null);
                }
            } catch (error) {
                setLoading(false);
                setImageSrc(null);
            }
        };

        if (userImage) {
            loadImage();
        } else {
            setImageSrc(null);
        }
    }, [avatarSrc, userImage]);

    return (
        <div className={`rounded-full overflow-hidden relative border-2 border-green_${user.userRoleId == 2 ? " min-w-[55px]" : ""}`} style={avatarSize}>
            {userImage && imageSrc ? (
                <img
                    src={imageSrc}
                    className="w-full h-full object-cover"
                    alt="Profile Picture"
                    style={{ ...imageSize, objectFit: 'cover' }}
                />
            ) : (
                <Avatar style={{ ...imageSize, objectFit: 'cover' }} alt={name}>
                    {name ? name.charAt(0).toUpperCase() : "U"}
                </Avatar>
            )}
        </div>
    );
};

export default ProfileImage;
