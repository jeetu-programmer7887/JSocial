import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // 'instant' behavior feels snappier for page transitions than 'smooth'
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, [pathname]); // This triggers every time the URL path changes

    return null; // This component is invisible, it just runs logic
}