# PIPELINE.md — CAMT Bookshop

Rename this file to `PIPELINE.md` and fill every section. Links must be clickable URLs to
runs in **your** repository. Screenshots go in `docs/` and are linked from here.

Student ID: 662115010 Name: Chawaphat Akaraphat Repository: https://github.com/Chawaphat/camt-bookshop

Production URL: **\*\*\*\***\*\*\*\***\*\*\*\***\_\_\_\_**\*\*\*\***\*\*\*\***\*\*\*\***

## 1. Pipeline at a glance

Draw your pipeline as a Mermaid flowchart: the three workflows, their triggers, their jobs,
the `needs:` arrows between jobs, and where Vercel receives a deployment.

```mermaid
flowchart LR
  %% replace with your pipeline
```

## 2. Evidence

| AC        | What                                                                                | Link / screenshot                                                                                                                                      |
| --------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-03.2   | screenshot of the Vercel dashboard's deployment list — every entry made by Actions  |                                                                                                                                                        |
| AC-03.4   | screenshot of Deployment Protection: Vercel Authentication on, bypass created       | ![alt text](docs/ac-03.4-OpenVercelAuthen.png) ![alt text](docs/ac-03.4-ProtectionBypass.png) ![alt text](docs/ac-03.4-withVercelProtectionheader.png) |
| AC-04.3–4 | a green `PR gate` run: smoke → deploy-preview → test-preview, with the preview URL  |                                                                                                                                                        |
| AC-04.6   | the same run's duration, warm cache                                                 |                                                                                                                                                        |
| AC-05.1–3 | screenshot of the branch protection / ruleset settings                              |                                                                                                                                                        |
| AC-05.4   | the pull request whose merge was blocked by a red required check                    |                                                                                                                                                        |
| AC-06.3–4 | a green `Main pipeline` run: test → deploy-production → verify                      |                                                                                                                                                        |
| AC-06.7   | the `Main pipeline` run with the test job red and the deploy skipped                |                                                                                                                                                        |
| AC-07.2   | three `Nightly` runs started by hand — one per target — each with its merged report |                                                                                                                                                        |
| AC-08.2   | the quarantine issue                                                                |                                                                                                                                                        |

## 3. Timings

| Run                                                   | Cold cache | Warm cache | Budget | Within? |
| ----------------------------------------------------- | ---------- | ---------- | ------ | ------- |
| PR gate (all three jobs)                              |            |            | 8 min  |         |
| Main pipeline (all three jobs)                        |            |            | 10 min |         |
| Nightly, target = production (start to merged report) |            |            | 20 min |         |
| Nightly, target = local (start to merged report)      |            |            | 20 min |         |

Which step did the browser cache save the most time on, and how much? **\*\***\_\_**\*\***

Nightly against production vs. against a local build — which was faster, and why? **\_\_**

## 4. Triage record — the quarantined test

|                                                   |                                                                                                                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Symptom                                           | fx.spec.ts sometimes fails because /api/rates returns 503.                                                                                                                                             |
| Local measurement (`--repeat-each=10`)            | 9 passed / 1 failed                                                                                                                                                                                    |
| Classification (regression / flaky / environment) | environment                                                                                                                                                                                            |
| Evidence that decided it                          | rates.get.ts randomly returns 503 with a 35% failure rate to simulate an external service failure.                                                                                                     |
| Containment applied                               | - Tagged `@quarantine`, with a link to this issue and an expiry date, in `tests/fx.spec.ts`, - Blocking jobs do not run `@quarantine` tests. `retries` stays at 2 (not raised to make this test pass). |
| Cure (planned or done)                            | Replace the test with two tests that control `/api/rates` using `page.route`:one for a successful answer and one for an outage.                                                                        |
| Expiry date                                       | 2026-10-30                                                                                                                                                                                             |

## 5. The teammate's pull request (PR-42)

1. What the PR gate reported (all three jobs), and why: **\*\***\*\***\*\***\_\_\_\_**\*\***\*\***\*\***
2. What the main pipeline reported, and which test(s) caught it: \***\*\*\*\*\***\_\_\***\*\*\*\*\***
3. What the Vercel dashboard and the production URL showed while `main` was red: **\_\_\_**
4. How you restored `main`: ****\*\*\*\*****\*\*****\*\*\*\*****\_\_\_****\*\*\*\*****\*\*****\*\*\*\*****
5. Your decision on Think first #10, with the reason: **\*\***\*\***\*\***\_**\*\***\*\***\*\***

## 6. Think-first answers

Copy all ten answers here, with the correction you made after running the command where
your first answer was wrong.

1. **Think first #1**
   > Predicted passes: 6

> Actual: 9

> Classification: Environment

> Evidence: The test fails because `GET /api/rates` sometimes returns 503 due to `Math.random() < fxFailureRate`, which has a 35% failure rate by default. The UI and test locator are correct. So, the same code can pass or fail randomly. Out of 10 runs, around 6–7 runs are expected to pass.

> ![alt text](docs/flakytestFrom10Test.png)
> ![alt text](docs/fx.spec.ts_return503.png)

2. **Think first #2**

> 1. .vercel/ → Vercel deployment files would be uploaded to GitHub.
> 2. blob-report/ → Playwright test report files would be uploaded to GitHub.
> 3. .env → Environment variables and possibly secret keys would be uploaded to GitHub.

3. **Think first #3**
   > Failure rate without `retry: 0`: About 12% (0.35 × 0.35 = 0.1225), because the app makes two requests and the test fails only if both return 503.

> Why worse: App retries hide the problem but do not fix it. They make failures harder to reproduce and leave less clear evidence in test reports. Playwright retries can mark tests as flaky and save traces for debugging. They can also be configured differently for CI and local testing, without changing the app's behavior.

4.**Think first #4**

> Answer: No, the password is not safe. Git keeps the commit history, so the old password can still be found using git log -p or GitHub's commit history. Since the repository is public, someone may have already copied it.

> What a real team should do:
> Rotate the password immediately and revoke the old one.
> Check the logs for suspicious activity.
> If necessary, remove the password from Git history using git filter-repo or BFG, then force-push the changes.

5.**Think first #5**

> P(fail) with 2 retries: 0.35³ = 0.042875 ≈ 4.3% with 5 retries: 0.35⁶ ≈ 0.0018 ≈ 0.18%
> (retries: N means N + 1 attempts, and the run fails only if every attempt fails.)

> Why still no: Retries only hide failures; they do not fix the 35% failure rate of the exchange-rate service. They can also hide real bugs in our code. Even a 0.18% failure rate can cause false alarms over many runs, making the team ignore failed builds. Extra retries also use more of the 8-minute budget. Instead, quarantine the unreliable test and fix it by controlling /api/rates with page.route.

6. **Think first #6**
   > Vercel: Its Git integration sees the push to main and builds and deploys that commit to production by itself, in parallel with GitHub Actions and without waiting for it. The deployment shows source "Git" and status Ready in the dashboard, while the GitHub check is red.

> Customers see: The buggy version, live. The red test job cannot stop or roll back a deployment that Vercel made on its own; the bug stays on the production URL until someone reverts or rolls back. This is the same failure as the laptop vercel --prod incident in the spec: a deployment that never passed through the gate. "git": { "deploymentEnabled": false } in vercel.json (AC-03.2) removes that path, so production can only change when the pipeline runs the CLI after the tests pass.

7.**Think first #7**

> Private window shows: Vercel's own login page ("Log in to Vercel"), not the app. The preview is protected by Vercel Authentication, so a visitor who is not logged in to Vercel cannot reach it directly.

> Tests without the bypass: Playwright is a visitor with no Vercel login, so every page.goto() would receive Vercel's authentication page instead of the app. The sign-in form and the "Books" heading never appear, so essentially every test fails by timeout. These failures are not product bugs, and the timeout messages do not mention authentication, so the red result would mislead.

> Fixes: (a) Turn Vercel Authentication off, so previews are public. (b) Keep it on and give the pipeline Protection Bypass for Automation: a secret sent in the x-vercel-protection-bypass header. Chosen: (b). A preview holds a pull request's unreviewed code, so it should not be open to anyone with the link. With (b) only the pipeline, which holds the secret as a repository secret, gets in, and previews stay private for everyone else (PL-03 / AC-03.4).

> Correction: My first prediction was that the private window would show the app's sign-in page. In fact I first opened it from the dashboard's Visit button in a browser that was logged in to Vercel. In a real private window Vercel asks me to log in first.

8.**Think first #8**

> Why: GitHub does not read the workflow YAML to guess job names. It builds the list of selectable required checks from check names that have actually been reported on this repository by earlier runs (the picker searches recent check runs). Until the workflow has run once, smoke and test-preview have never been reported, so there is nothing to select.

> A PR with a broken workflow file shows: The workflow never starts, so no check named smoke or test-preview is ever reported. With those checks required, the merge box stays on "Expected — Waiting for status to be reported" and the merge stays blocked. It is neither green nor red, just permanently pending. (The Actions tab may also show an "invalid workflow file" error.) The gate fails closed: a broken gate cannot let code through, but it also blocks every PR until the YAML is fixed. 9. 10.

## 7. One thing I would change

If you had a second week on this pipeline, what one change would make it more trustworthy
or cheaper, and how would you measure that it worked?
