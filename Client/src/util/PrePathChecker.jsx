import React from 'react'
import { useAuth } from '../Contexts/useHook'


function PrePathChecker() {
    const { prePath, setPrePath } = useAuth()

    switch (prePath) {
        case '/' :
            break
        case 'config' :
            break
        default:
    }
    return (
        <div>

        </div>
    )
}

export default PrePathChecker
