import { Suspense } from "react";
import { useLoaderData, useOutlet, Await } from "react-router-dom";

import { AuthProvider } from "../../hooks/useAuth";

export const AuthLayout = () => {

    // close camera if it is open
    if (window.obje) {
        window.obje.leave()
    }

    const outlet = useOutlet();

    const { userPromise } = useLoaderData();

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Await
                resolve={userPromise}
                errorElement={<div className="error">Something went wrong!</div>}
            >
                {(user) => (
                    <AuthProvider userData={user}>{outlet}</AuthProvider>
                )}
            </Await>
        </Suspense>
    );
};
