/**@type{import('tailwindcss').Config} */

import plugin from 'eslint-plugin-react-hooks';

export default{
    content:[
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",

    ],
    theme:{
        extend:{
            colors:{
                primary: '#27ae60',
                secondary:'#3498db',
                accent:'#e74c3c',
                'primary-dark':'#1e8449',
                'primary-light':'#58d68d',
            },
            fontFamily:{
                sans:['Inter','system-ui','sans-serif'],
                heading:['Poppins','sans-serif'],
            },
            animation:{
                'float':'float 6s ease-in-out infinite',
                'float-delay':'float 6s ease-in-out 2s infinite',
                'fade-in':'fadeIn 0.5s ease-out',
                'slide-in':'slideUp 0.5s ease-out',
                'scale-in':'scaleIn 0.3s ease-out',
            },

            keyframes:{
                float:{
                    '0%,100%':{transform:'translateY(0px) rotate(0deg)'},
                    '50%':{transform:'translateY(-20px) rotate(5deg)'},
                },
                fadeIn:{
                    '0%':{opacity:'0'},
                    '100%':{opacity:'1'},
                },
                slideUp:{
                    '0%':{transform:'translateY(20px)',opacity:'0'},
                    '100%':{transform:'translateY(0)',opacity:'1'},
                },
                scaleIn:{
                    '0%':{transform:'scale(0.9)',opacity:'0'},
                    '100%':{transform:'scale(1)',opacity:'1'},
                },
            },
        },
    },
    plugins:[],
}