<?php
// sidebar.php
// Használat: $active = 'home' / 'calendar' stb.
$active = $active ?? 'home';

$items = [
  ['id'=>'home',     'label'=>'Home',        'href'=>'/app/index.php',     'icon'=>'home',     'dot'=>false],
  ['id'=>'calendar', 'label'=>'Naptár',      'href'=>'/app/calendar.php',  'icon'=>'calendar', 'dot'=>false],
  ['id'=>'tags',     'label'=>'Címkék',      'href'=>'/app/tags.php',      'icon'=>'tag',      'dot'=>false],
  ['id'=>'smile',    'label'=>'Ügyfelek',    'href'=>'/app/clients.php',   'icon'=>'smile',    'dot'=>false],
  ['id'=>'docs',     'label'=>'Dokumentum',  'href'=>'/app/docs.php',      'icon'=>'book',     'dot'=>false],
  ['id'=>'profile',  'label'=>'Profil',      'href'=>'/app/profile.php',   'icon'=>'user',     'dot'=>false],
  ['id'=>'megaphone','label'=>'Kampány',     'href'=>'/app/campaigns.php', 'icon'=>'megaphone','dot'=>false],
  ['id'=>'team',     'label'=>'Csapat',      'href'=>'/app/team.php',      'icon'=>'users',    'dot'=>true], // kék pötty
  ['id'=>'stats',    'label'=>'Statisztika', 'href'=>'/app/stats.php',     'icon'=>'chart',    'dot'=>false],
  ['id'=>'apps',     'label'=>'Appok',       'href'=>'/app/apps.php',      'icon'=>'grid',     'dot'=>false],
  ['id'=>'settings', 'label'=>'Beállítások', 'href'=>'/app/settings.php',  'icon'=>'settings', 'dot'=>false],
];

function iconSvg($name) {
  // Minimal, tiszta inline SVG ikonok (fehér stroke)
  $common = 'width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  switch ($name) {
    case 'home':
      return "<svg $common><path d='M3 11l9-8 9 8'/><path d='M5 10v10h14V10'/></svg>";
    case 'calendar':
      return "<svg $common><rect x='3' y='4' width='18' height='18' rx='2'/><path d='M16 2v4M8 2v4M3 10h18'/></svg>";
    case 'tag':
      return "<svg $common><path d='M20 10V4h-6L4 14l6 6 10-10Z'/><path d='M14 4l6 6'/></svg>";
    case 'smile':
      return "<svg $common><circle cx='12' cy='12' r='9'/><path d='M8 14s1.2 2 4 2 4-2 4-2'/><path d='M9 10h.01M15 10h.01'/></svg>";
    case 'book':
      return "<svg $common><path d='M4 19a2 2 0 0 1 2-2h14'/><path d='M6 3h14v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z'/></svg>";
    case 'user':
      return "<svg $common><path d='M20 21a8 8 0 0 0-16 0'/><circle cx='12' cy='8' r='4'/></svg>";
    case 'megaphone':
      return "<svg $common><path d='M3 11v2'/><path d='M6 9v6'/><path d='M8 10l12-4v12l-12-4v-4Z'/><path d='M6 15c0 2 1 4 3 4'/></svg>";
    case 'users':
      return "<svg $common><path d='M17 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1'/><circle cx='9' cy='8' r='3'/><path d='M22 21v-1a4 4 0 0 0-3-3.87'/><path d='M16 3.13a3 3 0 0 1 0 5.74'/></svg>";
    case 'chart':
      return "<svg $common><path d='M3 3v18h18'/><path d='M7 14l3-3 3 2 5-6'/></svg>";
    case 'grid':
      return "<svg $common><path d='M4 4h7v7H4z'/><path d='M13 4h7v7h-7z'/><path d='M4 13h7v7H4z'/><path d='M13 13h7v7h-7z'/></svg>";
    case 'settings':
      return "<svg $common><path d='M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z'/><path d='M19.4 15a7.8 7.8 0 0 0 .1-2l2-1.5-2-3.5-2.3.7a7.7 7.7 0 0 0-1.7-1L15 4h-6l-.6 2.7a7.7 7.7 0 0 0-1.7 1L4.4 7.9l-2 3.5 2 1.5a7.8 7.8 0 0 0 .1 2l-2 1.5 2 3.5 2.3-.7a7.7 7.7 0 0 0 1.7 1L9 20h6l.6-2.7a7.7 7.7 0 0 0 1.7-1l2.3.7 2-3.5-2.2-1.5Z'/></svg>";
    default:
      return "<svg $common><circle cx='12' cy='12' r='9'/></svg>";
  }
}
?>

<link rel="stylesheet" href="/assets/sidebar.css">

<aside class="x-sidebar" id="xSidebar" aria-label="Oldalsáv navigáció">
  <button class="x-sidebar__collapse" id="xSidebarCollapse" type="button" aria-label="Oldalsáv összecsukása">
    <span class="x-sidebar__collapseIcon">⟨⟩</span>
  </button>

  <nav class="x-sidebar__nav">
    <?php foreach ($items as $it): 
      $isActive = ($active === $it['id']);
      $cls = "x-item" . ($isActive ? " is-active" : "");
    ?>
      <a class="<?= $cls ?>"
         href="<?= htmlspecialchars($it['href']) ?>"
         data-tooltip="<?= htmlspecialchars($it['label']) ?>"
         aria-current="<?= $isActive ? 'page' : 'false' ?>">
        <span class="x-item__icon" aria-hidden="true">
          <?= iconSvg($it['icon']); ?>
          <?php if (!empty($it['dot'])): ?>
            <span class="x-dot" aria-hidden="true"></span>
          <?php endif; ?>
        </span>
        <span class="x-item__label"><?= htmlspecialchars($it['label']) ?></span>
      </a>
    <?php endforeach; ?>
  </nav>

  <div class="x-sidebar__bottom">
    <a class="x-help" href="/app/help.php" data-tooltip="Súgó">
      <span class="x-item__icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M9.5 9.5a2.5 2.5 0 1 1 4.2 1.8c-.7.6-1.2 1.1-1.2 2.2"></path>
          <path d="M12 17h.01"></path>
        </svg>
      </span>
      <span class="x-item__label">Súgó</span>
    </a>
  </div>
</aside>

<script src="/assets/sidebar.js" defer></script>
