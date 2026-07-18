# 🎨 PEDIDOS DE SPRITES — agent-sprite-forge (Codex/ChatGPT)
## Bob em Busca da AGI Sagrada

> A skill [agent-sprite-forge](https://github.com/0x0funky/agent-sprite-forge) roda
> dentro do **Codex** (agente da OpenAI) e usa a geração de imagem nativa dele.
> Ela mesma cuida de: sprite sheet em grade, remoção do fundo, extração de frames,
> alinhamento pelos pés e exportação (PNG transparente + GIF + metadata JSON).
> Nosso trabalho é só PEDIR DIREITO. Este arquivo tem os pedidos prontos.

---

## ⚙️ SETUP (uma vez só)

No terminal, instalar a skill no Codex:

```powershell
git clone https://github.com/0x0funky/agent-sprite-forge.git
python -m pip install -r agent-sprite-forge\requirements.txt
Copy-Item -Recurse agent-sprite-forge\skills\* $env:USERPROFILE\.codex\skills\
```

Depois é só abrir o Codex e colar os pedidos abaixo, **um por vez**.

---

## 📌 REGRAS DE OURO (da própria skill)

1. **Um personagem por pedido.** Cada ação (idle/walk/attack) é gerada e aprovada
   separadamente — a skill já trabalha assim.
2. **Aprove o idle primeiro.** O idle aprovado vira o "gabarito" de escala e pés
   para as outras ações do mesmo personagem. Se o walk sair com outro visual,
   peça: *"Use the approved idle frame as scale and feet template."*
3. Heróis com arma no chão → a skill deve usar `preserve` + alinhamento `feet`
   (já está escrito nos pedidos).
4. Nunca aceite sheet de UMA linha (1x4): 4 frames = grade 2x2, 6 frames = 2x3.
5. Guarde os resultados na pasta `sprites/` do projeto, com os nomes indicados.

---

## 🦸 HERÓIS (bundles completos: idle + walk + attack + especial)

### 1. Bob "Indiana" Milgrau → `sprites/bob/`
```
$generate2dsprite
Create a controllable hero action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up, Streets of Rage 2 inspired), side view facing right,
feet alignment, preserve scale strategy.

Character: a Brazilian adventurer-archaeologist hero parodying Indiana
Jones. Male, brown leather jacket, classic fedora hat, nerdy round
glasses, short stubble beard, small expedition backpack. His weapon is a
glowing golden tablet held in one hand, with small neon glyphs floating
around it (abstract symbols, no readable text).

Actions, one grid each:
- idle (4 frames, 2x2): breathing, tablet glowing softly
- walk (6 frames, 2x3): determined stride
- attack (6 frames, 2x3): types on the tablet and a short blade of glowing
  text-energy slashes forward (keep the effect inside the cell)
- special (6 frames, 2x3): raises the tablet, burst of glowing glyphs
  around him

Generate and QC the idle first, then reuse it as scale/feet template for
the other actions.
```

### 2. Fê-Fê Li, a Vidente → `sprites/fefe/`
```
$generate2dsprite
Create a controllable hero action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up, Streets of Rage 2 inspired), side view facing right,
feet alignment, preserve scale strategy.

Character: a wise Asian-American woman scientist, elegant dark blazer,
shoulder-length dark hair, glowing bright blue eyes. She projects small
holographic targeting rectangles from her hands.

Actions, one grid each:
- idle (4 frames, 2x2): calm stance, eyes pulsing blue
- walk (6 frames, 2x3): composed confident stride
- attack (6 frames, 2x3): projects a targeting rectangle forward that
  locks and flashes (effect stays inside the cell)
- special (6 frames, 2x3): both arms open, several targeting boxes appear
  around her at once

Generate and QC the idle first, then reuse it as scale/feet template.
```

### 3. Loro Estocástico → `sprites/loro/`
```
$generate2dsprite
Create a creature hero action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up, Streets of Rage 2 inspired), side view facing right,
center alignment (it flies at chest height), preserve scale strategy.

Character: a chaotic neon-green parrot mascot, spiral hypnotic eyes,
feathers with a subtle dot pattern, mischievous unhinged energy. It
hovers instead of standing.

Actions, one grid each:
- hover (4 frames, 2x2): flapping in place, head twitching
- attack (6 frames, 2x3): squawks and a chaotic wave of scrambled glowing
  shapes bursts from its beak (abstract shapes, no readable letters)
- special (6 frames, 2x3): eyes spin, colorful glitch aura explodes
  around it

Generate and QC the hover first, then reuse it as scale template.
```

### 4. Escudeiro Mil Grau → `sprites/escudeiro/`
```
$generate2dsprite
Create a controllable hero action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up, Streets of Rage 2 inspired), side view facing right,
feet alignment, preserve scale strategy.

Character: a young Brazilian gamer, purple hoodie (hood down), gaming
headset around the neck, t-shirt with a small flame emblem (symbol only,
no text), flip-flop sandals. His weapon is a giant mechanical keyboard
held like a two-handed war hammer.

Actions, one grid each:
- idle (4 frames, 2x2): keyboard resting on shoulder
- walk (6 frames, 2x3): heavy tank-like stride
- attack (6 frames, 2x3): overhead keyboard smash with small shockwave at
  impact (keep effect inside the cell)
- special (6 frames, 2x3): slams the ground, ring of glowing emoji-like
  shapes bursts around him (abstract shapes, no readable text)

Generate and QC the idle first, then reuse it as scale/feet template.
```

---

## 👹 CHEFÕES (bundles: idle + walk + 2 ataques + hurt)

> Chefões são maiores que os heróis. Diga isso no pedido — a skill mantém a
> escala relativa se você pedir.

### 5. Donald Trunfo → `sprites/trunfo/`
```
$generate2dsprite
Create a boss NPC action bundle in pixel_art style (16-bit Sega Genesis
beat 'em up, Streets of Rage 2 boss style), side view facing left, feet
alignment, preserve scale strategy. Boss proportions: bulkier and taller
than a standard hero sprite.

Character: a boss villain parody of a bombastic politician. Large man in
an oversized blue suit, extra-long red tie, orange swirled pompadour
hair, plain red cap (no text), orange-tinted skin, smug frown. Weapon: a
giant golden pen.

Actions, one grid each:
- idle (4 frames, 2x2): arms crossed, tie swaying
- walk (6 frames, 2x3): heavy strut
- attack_sign (6 frames, 2x3): signs a document in the air and flicks it
  forward as a paper-airplane missile (projectile stays inside cell)
- attack_rage (6 frames, 2x3): slams both fists, papers fly around him
- hurt (4 frames, 2x2): stumbles back, cap tilting

Generate and QC the idle first, then reuse it as scale/feet template.
Also create a separate projectile asset: paper-airplane missile,
projectile action, strip suitable for a small projectile (2x2), same
pixel_art style.
```

### 6. Ilon Mosca → `sprites/ilon/`
```
$generate2dsprite
Create a boss NPC action bundle in pixel_art style (16-bit Sega Genesis
beat 'em up, Streets of Rage 2 boss style), side view facing left, feet
alignment, preserve scale strategy. Boss proportions.

Character: a boss villain parody of a tech billionaire. Man in a plain
black t-shirt and dark jeans, short dark hair, smug smirk, smartphone in
one hand. He rides a small hovering rocket-platform (platform included in
the sprite, feet on it).

Actions, one grid each:
- idle (4 frames, 2x2): hovering, scrolling the phone
- move (6 frames, 2x3): platform tilts and glides
- attack_tweet (6 frames, 2x3): taps the phone and flicks a glowing
  message-shaped projectile downward (abstract rectangle, no text)
- attack_command (6 frames, 2x3): points forward commanding robots,
  platform flaring
- hurt (4 frames, 2x2): platform sputters and wobbles

Generate and QC the idle first, then reuse it as scale template.
```

### 7. Samuca Altíssimo → `sprites/samuca/`
```
$generate2dsprite
Create a boss NPC action bundle in pixel_art style (16-bit Sega Genesis
beat 'em up, Streets of Rage 2 boss style), side view facing left, feet
alignment, preserve scale strategy. Boss proportions.

Character: a boss villain parody of a startup CEO. Man in an expensive
plain grey sweater and jeans, short brown hair, wide corporate PR smile.
A tiny asterisk-shaped halo floats above his head.

Actions, one grid each:
- idle (4 frames, 2x2): juggling one product box casually
- walk (6 frames, 2x3): confident pitch-meeting stride
- attack_box (6 frames, 2x3): throws a cardboard product box forward
- attack_launch (6 frames, 2x3): raises arms in a keynote pose, glowing
  rectangles (abstract pop-up windows, no text) burst upward around him
- hurt (4 frames, 2x2): smile cracks for a moment, box drops

Generate and QC the idle first, then reuse it as scale/feet template.
Also create a separate impact asset: a burst of overlapping glowing
rectangles like pop-up windows (impact action, 2x2), same style.
```

### 8. Dário Amô-Dei → `sprites/dario/`
```
$generate2dsprite
Create a boss NPC action bundle in pixel_art style (16-bit Sega Genesis
beat 'em up, Streets of Rage 2 boss style), side view facing left, feet
alignment, preserve scale strategy. Boss proportions.

Character: a boss villain parody of a gentle-looking AI CEO. Man with
curly dark hair, navy blazer, kind professor face with a suspicious
smile. He wears a giant vacuum cleaner on his back like a proton pack,
transparent tank full of glowing data cubes, holding the vacuum hose as a
weapon. A fake golden halo is held above his head by a stick attached to
the backpack.

Actions, one grid each:
- idle (4 frames, 2x2): halo bobbing, tank bubbling
- walk (6 frames, 2x3): scholarly stroll with heavy backpack
- attack_vacuum (6 frames, 2x3): aims the hose forward, glowing suction
  cone pulling inward (effect inside the cell)
- attack_essay (6 frames, 2x3): opens a long paper scroll that unrolls
  dramatically upward (blank paper, no readable text)
- hurt (4 frames, 2x2): coughs, halo stick snaps sideways

Generate and QC the idle first, then reuse it as scale/feet template.
```

### 9. Xi Deep-Zeek → `sprites/deepzeek/`
```
$generate2dsprite
Create a large boss creature action bundle in pixel_art style (16-bit
Sega Genesis beat 'em up, Streets of Rage 2 boss style), side view facing
left, center alignment (serpentine flying creature), preserve scale
strategy. Large boss: this creature is much bigger than a hero sprite.

Character: an oriental dragon robot made of green circuit boards and
server racks, long serpentine body in an S-curve, red security-camera
eyes, neon whisker antennas, scales like small solar panels.

Actions, one grid each:
- idle (4 frames, 2x2): body undulating slowly, eyes scanning
- move (6 frames, 2x3): serpentine glide
- attack_clone (6 frames, 2x3): projects a glowing hologram copy of a
  generic hero silhouette in front of it
- attack_breath (6 frames, 2x3): breathes a stream of glowing binary-like
  dots (dots only, no readable digits)
- hurt (4 frames, 2x2): sparks along the body, one panel pops off

Generate and QC the idle first, then reuse it as scale template.
```

### 10. Gêmeo de Litografia (mini-chefe) → `sprites/gemeo/`
```
$generate2dsprite
Create a mini-boss NPC action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up), side view facing left, center alignment (it floats
slightly off the ground), preserve scale strategy.

Character: a guardian robot made of precision optics, chrome parts and
mirror lenses, with a monastic hooded silhouette and a large central lens.

Actions, one grid each:
- idle (4 frames, 2x2): floating, lens iris adjusting
- attack_beam (6 frames, 2x3): fires a purple ultraviolet beam from the
  central lens (beam contained in the cell)
- hurt (4 frames, 2x2): lens cracks, light flickers

Generate and QC the idle first, then reuse it as scale template.
```

---

## 🐜 INIMIGOS COMUNS (bundles enxutos: idle/walk + attack + death)

### 11. Drone-vagalume → `sprites/drone/`
```
$generate2dsprite
Create a small enemy creature action bundle in pixel_art style (16-bit
Sega Genesis beat 'em up), side view facing left, center alignment
(flying), preserve scale strategy. Small enemy: simple readable design,
smaller than a hero.

Character: a hostile flying drone shaped like a robotic firefly, four
little rotors, one big red camera eye, tiny grabber claws.

Actions, one grid each:
- hover (4 frames, 2x2): bobbing, rotors spinning
- attack (4 frames, 2x2): dive-swipe with the claws
- death (4 frames, 2x2): sparks, drops, small puff

Generate and QC the hover first.
```

### 12. Lobista Engravatado → `sprites/lobista/`
```
$generate2dsprite
Create a common enemy NPC action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up), side view facing left, feet alignment, preserve
scale strategy. Simpler design than heroes (grunt enemy).

Character: a corporate lobbyist goon. Tight grey suit, slicked-back hair,
sunglasses, forced smile, metal briefcase used as a weapon.

Actions, one grid each:
- walk (6 frames, 2x3): brisk business stride
- attack (6 frames, 2x3): briefcase swing
- death (4 frames, 2x2): spins and collapses, papers flying (blank paper)

Generate and QC the walk first.
```

### 12b. Advogado com Liminar (Fase 1) → `sprites/advogado/`
```
$generate2dsprite
Create a common enemy NPC action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up), side view facing left, feet alignment, preserve
scale strategy. Tougher grunt enemy, slightly heavier build than the
lobbyist.

Character: a corporate lawyer enemy. Navy blue three-piece suit with gold
tie, slicked grey hair, small round glasses, smug expression. He wields a
rolled-up legal injunction document like a club, and holds a leather
document folder as a shield in the other hand.

Actions, one grid each:
- walk (6 frames, 2x3): slow confident courtroom stride
- attack (6 frames, 2x3): overhead swing with the rolled injunction,
  loose papers bursting on impact (blank paper, no readable text)
- death (4 frames, 2x2): drops the folder, papers rain down, collapses

Generate and QC the walk first.
```

### 12c. O Estagiário Vibe-Coder (mini-chefe Fase 0) → `sprites/estagiario/`
```
$generate2dsprite
Create a mini-boss NPC action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up), side view facing left, feet alignment, preserve
scale strategy. Mini-boss proportions: slightly taller and bulkier than
a common grunt.

Character: an overworked outsourced intern villain, tragicomic energy.
Young man with messy hair and eye bags, wrinkled light-blue dress shirt
half untucked, loose tie, THREE lanyard badges hanging from his neck at
once, energy drink stains. He holds a tablet in one hand like a command
console and a giant coffee thermos in the other as a weapon.

Actions, one grid each:
- idle (4 frames, 2x2): exhausted breathing, checking the tablet
- walk (6 frames, 2x3): hurried burned-out shuffle
- attack (6 frames, 2x3): swings the giant coffee thermos, coffee splash
  arc (keep splash inside the cell)
- summon (6 frames, 2x3): raises the tablet overhead, glowing signal
  beams up (calling the drones!)
- hurt (4 frames, 2x2): stumbles, badges swinging
- death (4 frames, 2x2): sits down defeated, drops the tablet, head down

Generate and QC the idle first, then reuse it as scale/feet template.
```

### 12d. Gerente de Produto / PM (Fase 3) → `sprites/pm/`
```
$generate2dsprite
Create a common enemy NPC action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up), side view facing left, feet alignment, preserve
scale strategy. Grunt enemy.

Character: a tech Product Manager enemy. Teal quarter-zip fleece over a
company t-shirt, khaki pants, white sneakers, smartwatch, lanyard badge,
trendy haircut. He wields a rolled-up product roadmap poster like a
kendo sword and holds a coffee cup in the other hand. Confident
corporate-agile energy.

Actions, one grid each:
- walk (6 frames, 2x3): brisk stand-up-meeting stride, checking the
  smartwatch mid-walk
- attack (6 frames, 2x3): kendo-style overhead strike with the rolled
  roadmap, sticky notes flying on impact (blank notes, no text)
- death (4 frames, 2x2): drops the coffee, looks at it in despair,
  collapses dramatically

Generate and QC the walk first.
```

### 13. Robô Optimus (capanga) → `sprites/optimus/`
```
$generate2dsprite
Create a common enemy NPC action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up), side view facing left, feet alignment, preserve
scale strategy. Grunt enemy, mass-produced-soldier look.

Character: a humanoid robot soldier, sleek grey and black design, blank
dark face visor, stiff military posture.

Actions, one grid each:
- walk (6 frames, 2x3): stiff synchronized march
- attack (6 frames, 2x3): robotic straight punch
- death (4 frames, 2x2): powers down and folds to its knees

Generate and QC the walk first.
```

### 14. Crawler-aranha → `sprites/crawler/`
```
$generate2dsprite
Create a common enemy creature action bundle in pixel_art style (16-bit
Sega Genesis beat 'em up), side view facing left, feet alignment,
preserve scale strategy. Grunt enemy.

Character: a robotic spider with a book-scanner for a head, six
mechanical legs, glass belly tank full of glowing stolen data cubes.

Actions, one grid each:
- walk (6 frames, 2x3): skittering leg cycle
- attack (4 frames, 2x2): scanner head flashes a harsh light forward
- death (4 frames, 2x2): legs give out, tank shatters, cubes spill

Generate and QC the walk first.
```

---

## 🤝 ALIADOS E NPCs (poses simples)

### 15. Saci-Bot → `sprites/sacibot/`
```
$generate2dsprite
Create an ally summon action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up), side view facing right, feet alignment, preserve
scale strategy.

Character: a mischievous one-legged robot inspired by the Brazilian
folklore character Saci. Junkyard scrap-metal body with duct tape
patches, a small jet turbine replacing the missing leg, red beanie cap
with a glowing LED, one extendable grabber arm. A small pixel whirlwind
under him.

Actions, one grid each:
- idle (4 frames, 2x2): hopping in place on the turbine
- teleport (6 frames, 2x3): spins into a whirlwind and vanishes/reappears
- steal (6 frames, 2x3): grabber arm shoots forward and yanks back
  holding a generic weapon

Generate and QC the idle first.
```

### 16. CURUPIRA-1 → `sprites/curupira/`
```
$generate2dsprite
Create a friendly summon action bundle in pixel_art style (16-bit Sega
Genesis beat 'em up), side view facing right, feet alignment, preserve
scale strategy. Small cute proportions.

Character: a small friendly forest-spirit robot, the newborn Brazilian
AGI. Green and yellow color scheme, feet turned BACKWARDS (important
folklore detail), flame-like orange hair made of glowing fiber optic
cables, a simple kind screen face (two dot eyes and a pixel smile, no
text).

Actions, one grid each:
- idle (4 frames, 2x2): gentle glow pulsing, hair flickering
- awaken (6 frames, 2x3): boots up from dark to fully glowing
- help (6 frames, 2x3): claps and releases a small burst of green-yellow
  sparkles

Generate and QC the idle first.
```

### 17. Mira Mutante (loja) → `sprites/mira/`
```
$generate2dsprite
Create an npc idle in pixel_art style (16-bit Sega Genesis beat 'em up),
side view facing right, feet alignment, 2x2 grid (4 frames).

Character: a mysterious woman in a grey trench coat over startup-casual
clothes, dark hair in a low bun, holding an open briefcase glowing from
the inside, full of strange gadget prototypes, glancing over her shoulder
like a spy selling secrets. Idle: subtle breathing, briefcase glow
flickering.
```

### 18. Grão-Mestre Fundidor → `sprites/graomestre/`
```
$generate2dsprite
Create an npc idle in pixel_art style (16-bit Sega Genesis beat 'em up),
side view facing right, feet alignment, 2x2 grid (4 frames).

Character: a serene elderly monk-engineer, white cleanroom suit worn like
sacred monastic robes (hood down), thin white beard, calm wise smile,
holding up a glowing silicon wafer disc with both hands like a holy
relic, purple light reflections. Idle: wafer glow slowly pulsing.
```

### 19. Monge-engenheiro → `sprites/monge/`
```
$generate2dsprite
Create an npc idle in pixel_art style (16-bit Sega Genesis beat 'em up),
side view facing right, feet alignment, 2x2 grid (4 frames).

Character: a hooded engineer-monk in a white cleanroom bunny suit worn
like sacred robes, engraving a glowing microchip with a stylus like a
medieval scribe. Idle: engraving hand moving subtly, chip glow pulsing.
```

---

## 🏞️ CENÁRIOS DAS FASES (usar `$generate2dmap` ou imagem única)

> Cenário de beat 'em up é uma imagem larga única (não tile map). Peça assim —
> se a skill de mapa complicar, peça como imagem simples mesmo, sem grid:

### Modelo de pedido de cenário
```
$generate2dmap
Create a single baked side-scrolling stage background (no tiles, no
collision, single wide image) in pixel_art style, 16-bit Sega Genesis
Streets of Rage 2 stage style. Wide landscape format. Street/ground level
in the bottom third where characters walk. Rich background detail, empty
foreground play area. No characters, no readable text anywhere.

Scene: [DESCRIÇÃO DA FASE]
```

### Descrições por fase (substituir no modelo)
| Arquivo | Scene |
|---|---|
| `sprites/bg_saopaulo.png` | São Paulo, Brazil: rooftops and street at night, tangled power lines, graffiti with abstract shapes, a small newsstand, warm yellow-lit windows, distant skyline with a TV tower silhouette |
| `sprites/bg_washington.png` | an absurdly golden presidential oval office: golden curtains, marble columns, ornate self-portraits with blurry faces, eagle-holding-a-chip carpet, chandeliers |
| `sprites/bg_fabrica.png` | endless robot factory interior: assembly lines with rows of identical humanoid robots, industrial pipes, sparks, a giant rocket through a huge back window, harsh neon |
| `sprites/bg_vale.png` | glass corporate tech campus interior: colorful bean bags, ping pong table, glass meeting rooms, a giant wall with a huge asterisk symbol, blank sticky notes, fake plants |
| `sprites/bg_biblioteca.png` | cathedral-library hybrid: towering shelves of glowing GPU racks and server blades instead of books, stained glass with scroll motifs, candles mixed with LED server lights, stone arches, distant hooded silhouettes |
| `sprites/bg_muralha.png` | cyberpunk Great Wall of China: bricks made of server racks, red lantern surveillance cameras, neon fog, circuit-board dragons in the clouds, red and teal palette |
| `sprites/bg_formosa.png` | island fortress that is both monastery and chip fab: cleanroom temple corridors, purple UV lighting, stained glass made of silicon wafer discs, a massive sacred machine on a central altar, ocean through the arches |
| `sprites/bg_labs.png` | improvised genius lab in Brazil: GPU stacks with duct tape, ceiling fan cooling a server rack, Brazilian flag on the wall, whiteboard with abstract scribbles and a tiny capybara doodle, warm cozy lighting |

---

## 🎬 CUTSCENE DE INTRODUÇÃO (6 painéis narrados)

> São imagens ÚNICAS de cinemática (não sprites!). Peça uma por vez, formato
> paisagem largo. Salvar como `sprites/story/intro-1.png` até `intro-6.png`.
> Modelo de pedido:

```
Create a single 16-bit pixel art cinematic cutscene still, wide landscape
format, in the style of Streets of Rage 2 / Golden Axe story panels.
Dramatic lighting, rich detail, painterly pixel art. NO text, NO letters,
NO watermark anywhere.

Scene: [CENA]
```

| Arquivo | Scene |
|---|---|
| `intro-1.png` | ancient cave-temple wall covered in prehistoric-style paintings depicting a glowing golden chalice made of circuit boards, worshipped by primitive figures, torchlight flickering on stone, mystical atmosphere |
| `intro-2.png` | dark silhouettes of five giant corporate towers reaching like claws toward a glowing circuit-chalice floating in a stormy night sky, lightning, ominous mood |
| `intro-3.png` | a stylized pixel art world map at night with five fortress strongholds glowing in different continents (golden palace, robot factory, glass campus, cathedral, great wall), red beams connecting them |
| `intro-4.png` | a small warm garage laboratory in Brazil at night, a diverse group of silhouetted people gathered around a glowing green-and-yellow computer screen, hopeful cozy lighting, brazilian flag on the wall |
| `intro-5.png` | heroic low-angle shot of an adventurer with fedora hat and leather jacket standing on a São Paulo rooftop at night holding a glowing golden tablet, a neon-green parrot flying beside him, moonlight, wind in the jacket |
| `intro-6.png` | menacing swarm of small drones with red camera eyes approaching a lit studio window at night seen from outside, dark blue night, red glow reflections, tension |

## 🎬 CUTSCENE DE ENCERRAMENTO (6 painéis finais)

> Mesmo formato da introdução: imagens únicas de cinemática, paisagem larga.
> Salvar como `sprites/story/final-1.png` até `final-6.png`. Use o mesmo
> modelo de pedido da introdução (16-bit cinematic still, NO text).

| Arquivo | Scene |
|---|---|
| `final-1.png` | inside a warm garage laboratory, a small green-and-yellow forest-spirit robot with backwards feet and fiber-optic flame hair opening its glowing screen-eyes for the first time inside a training capsule, green-gold light flooding the room, silhouettes watching in awe |
| `final-2.png` | jubilant celebration in the garage lab: diverse crowd of researchers and community members cheering and crying with joy, confetti, a neon-green parrot fainting dramatically in the air, warm festive lighting |
| `final-3.png` | five defeated villains (bombastic politician, billionaire on a rocket, grinning CEO, gentle professor with vacuum backpack) grumpily using computers with a glowing green-yellow AI assistant on their screens, funny defeated expressions |
| `final-4.png` | a majestic circuit-board dragon lounging on a distant balcony at dusk, finishing a Brazilian pastel snack, one claw raised in silent approval, a small glowing holographic "merge" symbol floating beside it (abstract symbol, no text) |
| `final-5.png` | the small forest-spirit robot standing proudly over a glowing map of Brazil, green and yellow light radiating outward across the whole continent, hopeful epic tone, community silhouettes holding hands around the glow |
| `final-6.png` | sunrise over São Paulo rooftops: the hero team (fedora adventurer, scientist woman, gamer with keyboard, neon parrot, small glowing robot) seen from behind watching the horizon, golden morning light, peaceful epic ending shot |

## 🌍 MAPA-MÚNDI DE VIAGENS (tela de escolha de missão)

> **IMPORTANTE — mande o esboço como referência:** abra o jogo, chegue na tela
> "🌍 ESCOLHA SUA MISSÃO" (depois da Fase 0), tire um print (Win+Shift+S) e
> **anexe a imagem no pedido**. O Codex vai usar o esboço pra manter o layout
> dos continentes nas MESMAS posições (os pinos do jogo são desenhados por
> cima da imagem em coordenadas fixas!).
>
> Salvar como `sprites/worldmap.png` — o jogo troca o esboço automaticamente.

```
[ANEXE O PRINT DO ESBOÇO]

Use the attached rough sketch as the exact layout reference. Create a
16-bit pixel art world map for a retro adventure game mission-select
screen, in the style of Indiana Jones travel maps mixed with Super Mario
World's world map. Wide 16:9 landscape.

Requirements:
- Keep the continents in the SAME positions and proportions as the sketch
  (North America upper-left, South America lower-left-center, Europe/Africa
  center, Asia upper-right, Oceania lower-right)
- Dark night-blue ocean with subtle pixel waves and faint grid/latitude lines
- Continents in muted dark greens and browns, vintage expedition-map feel,
  slightly weathered like old parchment edges in the corners
- Small landmark silhouettes barely visible: a golden capitol dome in the
  US east coast, a rocket in Texas, glass towers on the US west coast, a
  cathedral in Europe, a great wall + dragon silhouette in China, and a
  small glowing green-yellow beacon in Brazil (São Paulo area)
- Leave generous EMPTY margins at top (for the title) and bottom (for the
  mission info panel) — keep those areas mostly dark ocean
- NO text, NO letters, NO markers/pins (the game draws them), NO watermark
```

> Se os continentes saírem fora do lugar, responda: "Regenerate and match
> the attached sketch layout exactly — same continent positions."

## 🗺 FUNDO DA TELA "O PLANO DA AGI SAGRADA"

> Salvar como `sprites/plano_bg.png`. O jogo aplica um véu escuro por cima e
> desenha as 8 cartas de conquista — então o fundo deve ser ambiente, sem
> elementos centrais chamativos.

```
Create a 16-bit pixel art background of a secret war-room planning board,
wide 16:9 landscape. An old cork board and blueprint wall in a dim garage
laboratory at night, seen straight-on.

Details: pinned blueprint sheets of a computer laboratory, red strings
connecting pins, small polaroid-style photo frames (blurry contents),
sticky notes (blank), a drawn circuit diagram, coffee mug stains, a small
Brazilian flag pin, warm desk-lamp light from one corner, mostly dark
moody blue-green tones.

Composition: keep the CENTER of the image low-contrast and uncluttered
(the game draws 8 achievement cards over it in a 4x2 grid) — put the
interesting details near the edges and corners.
NO text, NO letters, NO watermark.
```

## 🎬 PÔSTER DA TELA DE ABERTURA (com o elenco!)

> Salvar como `sprites/title_bg.png`. O jogo desenha o LOGO por cima na parte
> superior e os textos/menu embaixo — então o elenco deve ficar no meio, com
> as áreas de cima e de baixo mais escuras e livres.
> **Dica de consistência:** anexe no pedido os frames idle dos personagens
> (`sprites/bob/idle/idle-1.png`, `fefe`, `escudeiro`, `loro/hover`) como
> referência visual!

```
[ANEXE OS SPRITES DOS HERÓIS COMO REFERÊNCIA]

Create an epic 16-bit pixel art movie-poster style key art for a retro
beat 'em up game, wide 16:9 landscape, Indiana Jones adventure poster
composition.

Center: the hero team in dramatic poses on a São Paulo rooftop at night —
a Brazilian adventurer with fedora hat and leather jacket holding a
glowing golden tablet (center, largest), flanked by a wise Asian-American
woman scientist with glowing blue eyes and a young gamer in a purple
hoodie wielding a giant mechanical keyboard; a neon-green parrot flies
above them.

Background, looming huge and dark in the storm clouds: the shadowy faces
of the villains — a smug politician with an extra-long red tie, a tech
billionaire on a rocket, a grinning CEO with an asterisk halo, a gentle
professor with a vacuum backpack, and a circuit-board dragon coiling
through the clouds. A golden circuit-chalice glows faintly at the top of
the sky between the clouds.

Composition: keep the TOP 25% darker and less detailed (game logo goes
there) and the BOTTOM 20% in shadow (menu text goes there).
Vibrant retro palette, dramatic rim lighting, chunky pixels.
NO text, NO letters, NO watermark.
```

## 🎥 LOGOTIPO DO TÍTULO (estilo pôster de Hollywood)

> Salvar como `sprites/title_logo.png`. A tela de título usa automaticamente.

```
Create a Hollywood blockbuster movie title logo that says exactly:
"BOB EM BUSCA DA AGI SAGRADA"

Style: Indiana Jones adventure movie franchise logo. Massive 3D golden
beveled letters with warm metallic shine, weathered like an ancient relic,
subtle circuit-board engravings inside the letters, dramatic rim lighting,
slight arc composition with "BOB EM BUSCA DA" smaller on top and
"AGI SAGRADA" huge below. A faint golden glow behind the letters.
Transparent background (or solid black background). Wide landscape format.
The text must be spelled EXACTLY as written, in Portuguese, all caps.
No other text, no watermark.
```

> Se as letras saírem erradas (acontece!), responda: "Regenerate, the text
> must read exactly BOB EM BUSCA DA AGI SAGRADA, fix the spelling."

## ✅ ORDEM DE GERAÇÃO RECOMENDADA

### 🎯 Lote 1 — DEMO DA FASE 0 (só isso já roda o jogo!)
1. `bob` (idle → walk → attack → special)
2. `drone` (hover → attack → death)
3. `lobista` (walk → attack → death)
4. `bg_saopaulo`

### Lote 2 — heróis restantes
5. `fefe` · 6. `loro` · 7. `escudeiro`

### Lote 3 — Fase 1 completa
8. `trunfo` (+ projétil avião de papel) · 9. `bg_washington`

### Lote 4 em diante — uma fase por vez
Ilon+fábrica → Samuca+vale → Dário+biblioteca → Deep-Zeek+muralha →
Gêmeo+Formosa+NPCs → CURUPIRA+Saci-Bot+labs → Mira

> **Dica final:** ao terminar cada personagem, peça ao Codex o GIF de preview e
> confira: escala consistente entre ações? pés na mesma linha? nada cortado na
> borda da célula? Se sim, aprova e parte pro próximo. Traga os arquivos pra
> pasta `sprites/` do projeto que eu monto o jogo com eles.
