# Issue: Windows packaged app shows white list/form sections (style regression)

## Summary
In Windows packaged builds, pages such as:
- `client/src/features/clients/routes/ClientPage.tsx`
- `client/src/features/agents/routes/AgentPage.tsx`

show major style regressions:
- list sections appear plain white
- form text/input contrast is broken (white-on-white in some areas)

The same app appears visually correct in browser production preview.

## Environment
- Platform: Windows 10 VM
- Distribution: packaged desktop app (Tauri)
- Status: reproducible in installed app

## Expected behavior
- Same visual theme and contrast as browser production preview.
- Agent/client tables and form fields should preserve DaisyUI/Tailwind design tokens.

## Actual behavior
- White backgrounds and poor contrast in multiple UI blocks.
- Design looks unstyled/partially styled in packaged app.

## Notes from build logs
Observed warning during `vite build`:

```text
Found 1 warning while optimizing generated CSS:
@property --radialprogress { ... } Unknown at rule: @property
```

Also saw chunk-size warning (`>500kB`), likely unrelated to this visual issue.

## Suspected root causes (to verify)
1. WebView runtime compatibility gap (CSS features support in Windows runtime vs browser).
2. DaisyUI/Tailwind generated tokens not fully interpreted in packaged WebView.
3. Theme variable fallback behavior differs in installed desktop runtime.

## Impact
- UI/UX degradation in production desktop app.
- Users cannot reliably read/fill some form areas.

## Optional screenshots
- Screenshot (Clients page): _attach here_
- Screenshot (Agents page): _attach here_
- Screenshot (form input contrast issue): _attach here_

## Acceptance criteria
1. Packaged Windows app renders clients/agents pages with intended theme.
2. Forms have readable text and correct contrast.
3. No white-on-white/unstyled blocks in desktop production runtime.
4. Browser preview and packaged app rendering are visually consistent for these pages.
