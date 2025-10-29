
export function CircleArrowToright({ fillColor }) {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1422_173)">
                <path d="M7.99992 10.6666L10.6666 7.99992M10.6666 7.99992L7.99992 5.33325M10.6666 7.99992H5.33325M14.6666 7.99992C14.6666 11.6818 11.6818 14.6666 7.99992 14.6666C4.31802 14.6666 1.33325 11.6818 1.33325 7.99992C1.33325 4.31802 4.31802 1.33325 7.99992 1.33325C11.6818 1.33325 14.6666 4.31802 14.6666 7.99992Z" stroke={fillColor} strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_1422_173">
                    <rect width="16" height="16" fill={fillColor} />
                </clipPath>
            </defs>
        </svg>
    );
}