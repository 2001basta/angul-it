# AngulIt

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.0.


## Development server

To start a local development server, run:

```bash
ng serve
```

project run in `http://localhost:4200/`.


## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory.



## Architecture

AngulIt is a multi-stage CAPTCHA flow: a user starts a session, answers a
random set of challenges one at a time, then sees a scored result.

### Flow

```
Home ("/")  --start-->  Captcha ("/captcha")  --3/3 answered-->  Result ("/result")
                              ^  |
                              |  | previous / next
                              +--+
```

- **`/`** — `Home` resets any previous session, asks `CaptchaService` to
  build a new one, then navigates to `/captcha`.
- **`/captcha`** — `Captcha` shows one challenge at a time. It redirects
  back to `/` if there is no active session (e.g. direct URL access).
- **`/result`** — `Result` shows the score and a per-question breakdown.
  `ResultGuard` blocks direct access until the session is completed,
  sending the user back to `/captcha` otherwise.

### Pieces

| File | Responsibility |
|---|---|
| `models/challenge.ts` | `Challenge` shape (`math` \| `text` \| `image`) and `CaptchaState`. |
| `service/captcha_service.ts` | Single source of truth: picks a random set of challenges, tracks the current stage and answers, scores the session, and persists/restores everything to `localStorage` (guarded for SSR via `isPlatformBrowser`). |
| `components/home` | Entry screen — starts a session. |
| `components/captcha` | Renders the current challenge (text input for `math`/`text`, a selectable image grid for `image`), validates the answer with a Reactive Form before allowing `next()`, and lets the user go back with `previous()`. |
| `components/result` | Reads the finished session from the service and displays score + details. |
| `guard/guard.ts` | `ResultGuard` — route guard enforcing the "no result without completion" rule. |

