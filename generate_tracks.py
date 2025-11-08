import csv
import random

# Theme and color distributions
themes = {
    'moonlight': {'count': 20, 'colors': ['electric', 'softPink', 'softGreen', 'softYellow']},
    'zenfocus': {'count': 20, 'colors': ['electric', 'softPink', 'softGreen', 'softYellow']},
    'ocean': {'count': 20, 'colors': ['midnight', 'tropical', 'sunset', 'arctic', 'emerald']},
    'creativeflow': {'count': 20, 'colors': ['electric', 'softPink', 'softGreen', 'softYellow']},
    'brainboost': {'count': 15, 'colors': ['electric', 'softPink', 'softGreen', 'softYellow']},
    'mentalfocus': {'count': 5, 'colors': ['electric', 'softPink', 'softGreen', 'softYellow']},
}

# Track templates (continuing from NM010)
tracks_data = []

# Generate track distribution
track_assignments = []
for theme, info in themes.items():
    for _ in range(info['count']):
        color = random.choice(info['colors'])
        track_assignments.append((theme, color))

# Shuffle to distribute evenly
random.shuffle(track_assignments)

# Start from track 10
for i in range(10, 101):
    theme, color = track_assignments[i - 10]
    track_id = f"NM{str(i).zfill(3)}"

    # Generate track data based on track number patterns
    if i % 5 == 0:  # Delta waves
        title = f"Delta Sleep Wave {i // 5}"
        freq = "0.5-3Hz"
        wave_type = "Delta"
    elif i % 5 == 1:  # Theta waves
        title = f"Theta Dream Space {i}"
        freq = "4-7Hz"
        wave_type = "Theta"
    elif i % 5 == 2:  # Alpha waves
        title = f"Alpha Calm Flow {i}"
        freq = "8-12Hz"
        wave_type = "Alpha"
    elif i % 5 == 3:  # Mixed waves
        title = f"Deep Rest Blend {i}"
        freq = "2-6Hz"
        wave_type = "Theta-Delta"
    else:  # Light Delta
        title = f"Gentle Night {i}"
        freq = "1-4Hz"
        wave_type = "Delta"

    # Music prompt template
    music_prompt = f"Create {wave_type.lower()} wave ambient music for deep sleep. Frequency: {freq}. Blend soft ASMR textures warm atmosphere gentle sounds. No sudden changes. Everything slow peaceful intimate safe. Include subtle nature elements. Balanced frequencies zero harsh sounds."

    # Video title
    video_title = f"{title} 🌙 1 Hour Sleep Music"

    # Korean caption template
    caption_kr = f"""편안한 밤이에요 💙

이 음악은 {wave_type} 파형({freq})으로 깊은 휴식을 도와줘요. 하루의 피로를 부드럽게 풀어주는 시간이에요.

✨ 이렇게 들어보세요:
• 조용한 공간에서 편안한 자세로
• 천천히 호흡하며 음악에 집중해요
• 15-20분 정도 지나면 자연스럽게 졸음이 와요

💫 이 음악이 도와줄 거예요:
• 복잡한 생각을 내려놓을 수 있어요
• 몸과 마음의 긴장이 풀려요
• 깊고 편안한 잠에 빠져들어요

매일 밤 같은 시간에 루틴으로 만들면 더 효과적이에요. 뇌가 이 음악을 듣는 순간 자연스럽게 잠 준비를 시작하게 돼요.

오늘도 수고 많으셨어요 ✨
편안한 밤 되세요 🌙

#{wave_type}Waves #DeepSleep #수면음악 #깊은수면 #BinauralBeats #힐링음악 #명상음악 #불면증 #숙면 #RelaxationMusic"""

    # English caption
    caption_en = f"""Have a peaceful night 💙

This music uses {wave_type} waves ({freq}) to help you rest deeply. It's time to gently release the day's fatigue.

✨ Here's how to listen:
• Find a quiet space and get comfortable
• Breathe slowly while focusing on the music
• After 15-20 minutes, you'll naturally feel sleepy

💫 This music will help you:
• Let go of complicated thoughts
• Release tension from body and mind
• Fall into deep, peaceful sleep

More effective when made into a nightly routine at the same time. Your brain will naturally start preparing for sleep the moment it hears this music.

You worked hard today ✨
Have a comfortable night 🌙

#{wave_type}Waves #DeepSleep #SleepMusic #BinauralBeats #HealingMusic #Meditation #Insomnia #RestfulSleep #Relaxation"""

    tracks_data.append({
        'ID': track_id,
        'Title': title,
        'Music_Prompt': music_prompt,
        'Video_Title': video_title,
        'Video_Caption_KR': caption_kr,
        'Video_Caption_EN': caption_en,
        'Theme': theme,
        'ColorPreset': color
    })

# Read existing tracks
existing_tracks = []
with open('neural-music-100-tracks-v2.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    existing_tracks = list(reader)

# Combine existing + new tracks
all_tracks = existing_tracks + tracks_data

# Write complete CSV
with open('neural-music-100-tracks-complete.csv', 'w', encoding='utf-8', newline='') as f:
    fieldnames = ['ID', 'Title', 'Music_Prompt', 'Video_Title', 'Video_Caption_KR', 'Video_Caption_EN', 'Theme', 'ColorPreset']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(all_tracks)

print(f"Complete! Generated {len(all_tracks)} tracks total")
print(f"   - Existing tracks: {len(existing_tracks)}")
print(f"   - New tracks: {len(tracks_data)}")
print(f"   - Output: neural-music-100-tracks-complete.csv")
