---
title: '[0->1]x^a (log(x))^nの広義積分が，a>-1で収束することを示す'
excerpt: ''
coverImage: '/assets/default.webp'
date: '2024-05-05'
ogImage:
  url: '/assets/default.webp'
tags:
  - 'math'
  - '解析'
---

# 問題

$a \in \mathbb{R}, n \in \mathbb{N}$ とし，

$$
I(n, a) = \int_0^1 x^a (\log x)^n dx
$$

とおく．
$a>-1$ ならば $I(n, a)$ は収束することを示せ．

# 証明

まず，任意の実数 $\varepsilon > 0$ に対して，

$$
\lim_{x \to 0} x^{\varepsilon} (\log x)^n = 0
$$

が成り立つ．

これは．ロピタルの定理を繰り返し用いることによって，

$$
\lim_{x \to +0} x^{\varepsilon} (\log x)^n = \lim_{x \to 0} \frac{(\log x)^n}{x^{-\varepsilon}}
$$

$$
= \lim_{x \to 0} \frac{n!}{(-\varepsilon)^n} \frac{1}{x^{-\varepsilon}} = 0
$$

と計算できるからである．

次に， $a > -1$ ならば， $-a \lt d \lt 1$ となるような実数 $d$ が存在する．

このとき，そのような $d$ で $d+a > 0$ を満たすので，

$$
\lim_{x \to +0} x^d |x^a (\log x)^n| = \lim_{x \to 0} x^{d+a} (\log x)^n = 0
$$

である．

よって，適当な実数 $\delta$ が存在して， $0 \lt x \lt \delta$ ならば，

$$
x^d|x^a (\log x)^n| \lt 1
$$

$$
\Leftrightarrow |x^a (\log x)^n| \lt \frac{1}{x^d}
$$

を満たす．

両辺を $0$ から $\delta$ まで積分すると，

$$
\lim_{m \to 0} \int_m^{\delta} |x^a (\log x)^n| dx \lt \lim_{m \to 0} \int_m^{\delta} \frac{1}{x^d} dx
$$

であり， $1 > d$ より右辺は収束するので，左辺も収束する．

また， $|x^a (\log x)^n|$ は $[\delta, 1]$ で連続だから， $\int_{\delta}^1 |x^a (\log x)^n| dx$ は存在する．

従って，$I(n, a)$ は収束する． $\square$
