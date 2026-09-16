# chat-dock

A read-only view of one Claude Code session running in cmux, docked beside any page: the transcript, one button that goes to (or reopens) the tab, the claude.ai link. Used by Social Scraper and Music.

```tsx
import { ChatDock, doorClient } from '@chrisshawyeah/chat-dock';
import '@chrisshawyeah/chat-dock/chat-dock.css';

<ChatDock client={doorClient(url, token, 'social-scraper')} projectLabel="Social Scraper" tabs={[...]} onClose={...} />
```

The door is `yue_server.py` on Chris's Mac (`/chat/state|transcript|open?project=`), fronted by `chatdock.chrisshaw.me`. Theme it with `--cd-*` CSS variables.
