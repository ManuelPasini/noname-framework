import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


export function initSwiper() {

    document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    new Swiper(gallery, {

        modules: [
            Navigation,
            Pagination
        ],

        loop: true,

        spaceBetween: 16,

        slidesPerView: 1,

        navigation: {
            nextEl: gallery.querySelector('.swiper-button-next'),
            prevEl: gallery.querySelector('.swiper-button-prev'),
        },

        /* pagination: {
            el: '.swiper-pagination',
            clickable: true,
        }, */


        breakpoints: {

            // tablet
            768: {
                slidesPerView: 2,
            },

            // desktop
            1200: {
                slidesPerView: Number(gallery.dataset.slidesDesktop) || 4,
            }

        }

    });
    });

}
