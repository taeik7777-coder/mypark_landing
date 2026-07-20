document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. 전체 풀페이지 스크롤 제어
    // =========================================================================
    const wrapper = document.getElementById('fullpage-wrapper');
    const sections = document.querySelectorAll('.section');
    const mainHeader = document.getElementById('mainHeader');
    const logo = document.getElementById('logo');
    const totalSections = sections.length;

    let currentIdx = 0;
    let isAnimating = false;
    let touchStartY = 0;
    let isScrollable = false;

    const isNativeScroll = () => false;

    const updateLogo = (index) => {
        if (index === 1) {
            mainHeader.style.opacity = '0';
            mainHeader.style.pointerEvents = 'none';
        } else {
            mainHeader.style.opacity = '1';
            mainHeader.style.pointerEvents = 'none';
            const theme = sections[index].getAttribute('data-theme');
            logo.src = theme === 'dark' ? 'img/MYPARK_white.png' : 'img/MYPARK_black.png';
            logo.onerror = function () {
                this.src = theme === 'dark'
                    ? 'https://dummyimage.com/400x120/006E3F/ffffff.png&text=MYPARK'
                    : 'https://dummyimage.com/400x120/F4F4F4/000000.png&text=MYPARK';
            };
        }
    };

    const moveToSection = (index) => {
        if (index < 0 || index >= totalSections || isAnimating) return;
        currentIdx = index;
        updateLogo(currentIdx);

        isAnimating = true;
        wrapper.style.transform = `translateY(-${currentIdx * 100}%)`;

        sections.forEach(sec => sec.classList.remove('active'));
        sections[currentIdx].classList.add('active');
        sections[currentIdx].classList.add('animated');

        const mainHeader = document.getElementById('mainHeader');
        if (window.innerWidth <= 991) {
            mainHeader.style.transform = `translateY(-${sections[currentIdx].scrollTop}px)`;
        } else {
            mainHeader.style.transform = 'none';
        }

        setTimeout(() => { isAnimating = false; }, 1200);
    };

    document.querySelectorAll('.js-move-section').forEach(btn => {
        btn.addEventListener('click', (e) => {
            moveToSection(parseInt(e.currentTarget.getAttribute('data-target'), 10));
        });
    });

    window.addEventListener('touchstart', (e) => {
        if (isNativeScroll()) return;
        touchStartY = e.touches[0].clientY;
        const sec = sections[currentIdx];
        const overflowY = window.getComputedStyle(sec).overflowY;
        isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && sec.scrollHeight > sec.clientHeight + 5;
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (isNativeScroll()) return;
        if (isScrollable) {
            const sec = sections[currentIdx];
            const currentAtTop = sec.scrollTop <= 1;
            const currentAtBottom = Math.ceil(sec.scrollTop + sec.clientHeight) + 1 >= sec.scrollHeight;
            const diff = touchStartY - e.touches[0].clientY;

            if ((diff > 0 && currentAtBottom) || (diff < 0 && currentAtTop)) {
                e.preventDefault();
            }
        } else {
            e.preventDefault();
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        if (isNativeScroll() || isAnimating) return;
        const diff = touchStartY - e.changedTouches[0].clientY;
        const sec = sections[currentIdx];
        const currentAtBottom = Math.ceil(sec.scrollTop + sec.clientHeight) + 1 >= sec.scrollHeight;
        const currentAtTop = sec.scrollTop <= 1;

        if (Math.abs(diff) < 50) return;

        if (diff > 50 && (!isScrollable || currentAtBottom)) moveToSection(currentIdx + 1);
        else if (diff < -50 && (!isScrollable || currentAtTop)) moveToSection(currentIdx - 1);
    }, { passive: false });

    window.addEventListener('wheel', (e) => {
        if (isNativeScroll() || isAnimating) return;
        const sec = sections[currentIdx];
        const overflowY = window.getComputedStyle(sec).overflowY;
        const isScrl = (overflowY === 'auto' || overflowY === 'scroll') && sec.scrollHeight > sec.clientHeight + 5;
        const atBottom = Math.ceil(sec.scrollTop + sec.clientHeight) + 1 >= sec.scrollHeight;
        const atTop = sec.scrollTop <= 1;

        if (isScrl) {
            if (e.deltaY > 0 && !atBottom) return;
            if (e.deltaY < 0 && !atTop) return;
        }
        if (Math.abs(e.deltaY) < 30) return;

        e.deltaY > 0 ? moveToSection(currentIdx + 1) : moveToSection(currentIdx - 1);
    }, { passive: false });

    window.addEventListener('resize', () => {
        wrapper.style.transform = isNativeScroll() ? 'none' : `translateY(-${currentIdx * 100}%)`;
        const mainHeader = document.getElementById('mainHeader');
        if (window.innerWidth > 991) {
            mainHeader.style.transform = 'none';
        } else {
            mainHeader.style.transform = `translateY(-${sections[currentIdx].scrollTop}px)`;
        }
    });

    sections.forEach(sec => {
        sec.addEventListener('scroll', (e) => {
            if (window.innerWidth <= 991 && sec.classList.contains('active')) {
                const mainHeader = document.getElementById('mainHeader');
                mainHeader.style.transform = `translateY(-${e.target.scrollTop}px)`;
            }
        });
    });

    // =========================================================================
    // 2. 스플릿 뷰 액션 및 동적 Lottie(돈) 제어
    // =========================================================================
    const splitSection = document.getElementById('splitSection');
    let lottieTimeout;

    const toggleSplit = (side) => {
        if (!splitSection) return;
        const lottieContainer = document.getElementById('money-container');
        if (side === 'right') {
            if (!splitSection.classList.contains('show-right')) {
                splitSection.classList.add('show-right');
                clearTimeout(lottieTimeout);
                lottieContainer.innerHTML = '';

                const player = document.createElement('dotlottie-player');
                player.setAttribute('src', 'https://lottie.host/10004b7c-07df-45a2-ae4e-1673b636d8c0/66Pc7WKf0U.lottie');
                player.setAttribute('background', 'transparent');
                player.setAttribute('speed', '0.8');
                player.setAttribute('autoplay', 'true');
                player.classList.add('lottie-player-fs');

                player.addEventListener('complete', () => {
                    player.style.opacity = '0';
                    lottieTimeout = setTimeout(() => {
                        if (lottieContainer.contains(player)) player.remove();
                    }, 800);
                });
                lottieContainer.appendChild(player);
            }
        } else {
            if (splitSection.classList.contains('show-right')) {
                splitSection.classList.remove('show-right');
                clearTimeout(lottieTimeout);
                lottieTimeout = setTimeout(() => { lottieContainer.innerHTML = ''; }, 600);
            }
        }
    };

    document.querySelectorAll('.js-split-panel').forEach(panel => {
        const side = panel.getAttribute('data-side');
        panel.addEventListener('click', () => toggleSplit(side));
        panel.addEventListener('mouseenter', () => toggleSplit(side));
    });

    setTimeout(() => { moveToSection(0); sections[0].classList.add('active'); sections[0].classList.add('animated'); }, 100);

});

// =========================================================================
// 3. 섹션 4 - 숫자 카운팅 애니메이션
// =========================================================================
const s4Container = document.querySelector('.section-4');

if (s4Container) {
    const counters = s4Container.querySelectorAll('.js-count');
    let isCounted = false;
    let isActivePrev = false;

    const runCounter = () => {
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            if (isNaN(target)) return;

            const duration = 2000;
            let startTime = null;

            counter.style.fontVariantNumeric = "tabular-nums";

            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);

                // ?먯옏怨?遺?쒕윭??easeOutCubic ?먯씠吏??곸슜
                const ease = 1 - Math.pow(1 - progress, 3);
                const current = target * ease;

                counter.innerText = current.toFixed(1);

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    counter.innerText = target.toFixed(1);
                }
            };
            window.requestAnimationFrame(step);
        });
    };

    setInterval(() => {
        const isCurrentlyActive = s4Container.classList.contains('active');

        if (isCurrentlyActive && !isActivePrev) {
            isActivePrev = true;
            if (!isCounted) {
                isCounted = true;
                setTimeout(() => {
                    runCounter();
                }, 800);
            }
        }
    }, 100);
}
// =========================================================================
// 4. 섹션 6 - 매장 슬라이더 애니메이션 (자동 생성)
// =========================================================================
const s6Slider = document.getElementById('s6-slider');
if (s6Slider) {
    // 0.jpg 부터 108.jpg 까지 동적으로 슬라이드 생성
    for (let i = 1; i <= 107; i++) {
        const slide = document.createElement('div');
        slide.className = 's6-slide';
        if (i === 0) slide.classList.add('active'); // 첫 번째 슬라이드 활성화
        slide.style.backgroundImage = `url('img/shop_name/${i}.jpg')`;
        s6Slider.appendChild(slide);
    }

    const slides = s6Slider.querySelectorAll('.s6-slide');
    let currentSlide = 0;

    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 3000);
    }
}

// =========================================
// 6. 섹션 7 - 페이지 이동 없는 견적 폼 제출 (안전망 200% 적용 버전)
// =========================================
document.addEventListener('DOMContentLoaded', function () {
    const myForm = document.querySelector('.mypark-form');

    if (myForm) {
        myForm.addEventListener('submit', function (e) {
            // 1. 브라우저가 폼스프리 사이트로 튕기는(페이지 이동) 현상 완벽 차단!
            e.preventDefault();

            const submitBtn = myForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerText;

            // 2. 제출 버튼을 '전송 중...'으로 바꾸고 중복 클릭 방지
            submitBtn.innerText = '신청 접수 중...';
            submitBtn.style.pointerEvents = 'none';
            submitBtn.style.opacity = '0.7';

            // 3. 폼 데이터를 구글 스크립트에 맞게 변환
            const formData = new FormData(myForm);
            
            // 마케팅 동의 체크 여부 명시적 추가 (체크 안하면 '미동의' 전송)
            if (!formData.has('마케팅동의')) {
                formData.append('마케팅동의', '미동의');
            }
            
            const urlEncodedData = new URLSearchParams(formData).toString();

            // 4. 화면 이동 없이 구글 스프레드시트로 전송
            fetch(myForm.action, {
                method: 'POST',
                body: urlEncodedData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(response => {
                // 구글 스크립트는 성공 시 redirect를 하거나 JSON을 반환함
                if (response.ok || response.type === 'opaque') {
                    alert('견적 신청이 성공적으로 완료되었습니다!\n담당자가 빠르게 연락드리겠습니다.');
                    myForm.reset(); // 성공 시 폼칸 깔끔하게 초기화
                } else {
                    alert('신청 중 서버 오류가 발생했습니다. 대표번호(1800-8907)로 문의해주세요.');
                }
            }).catch(error => {
                console.error('Fetch 에러:', error);
                // 브라우저 CORS 정책 등으로 에러가 잡혀도 실제 구글시트에는 기록되는 경우가 많음
                alert('정상적으로 접수되었거나 통신이 지연되고 있습니다.\n확인을 원하시면 1800-8907로 바로 전화 부탁드립니다.');
            }).finally(() => {
                // 5. 작업이 끝나면 버튼 원상복구
                submitBtn.innerText = originalText;
                submitBtn.style.pointerEvents = 'auto';
                submitBtn.style.opacity = '1';
            });
        });
    }
});