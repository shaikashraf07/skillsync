import cv2

video_path = "sample.mp4"  # Change to your video file

cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)

# Delay controls speed:
# Normal → 1000/fps | Slow → *2 | Fast → *0.5

modes = {    "Normal Motion": int(1000 / fps),
    "Slow Motion":   int(1000 / fps * 2),
    "Fast Motion":   int(1000 / fps * 0.5),
}

for mode, delay in modes.items():
    print(f"Playing: {mode} | Press Q for next")
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # rewind

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.putText(frame, mode, (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.imshow("Video", frame)
        if cv2.waitKey(delay) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()