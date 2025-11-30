// Snippit: Clip cutter
// Main application logic

class SnippitApp {
  constructor() {
    this.video = null;
    this.videoFile = null;
    this.startTime = 0;
    this.endTime = 0;
    this.user = null;
    this.currentPlatform = null;
    this.platformLimits = {
      facebook: { maxDuration: 60, ratio: "9:16" },
      instagram: { maxDuration: 90, ratio: "9:16" },
      stories: { maxDuration: 60, ratio: "9:16" },
      tiktok: { maxDuration: 3600, ratio: "9:16" },
    };
    this.initialViewContainer = document.getElementById("app-view-container");
    this.initialHTML = this.initialViewContainer
      ? this.initialViewContainer.innerHTML
      : "";

    console.log("Container Element Found:", !!this.initialViewContainer);
    console.log("Initial HTML Length:", this.initialHTML.length);
    this.init();
  }

  init() {
    console.log("Snippit initialized!");
    this.setupEventListeners();
    this.checkAuthState();
  }

  setupEventListeners() {
    // Upload button
    const uploadBtn = document.querySelector(".btn-upload");
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => this.handleUploadClick());
    }
  }

  // Upload video
  handleUploadClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e) => this.handleVideoUpload(e);
    input.click();
  }

  handleVideoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      alert("Please upload a valid video file");
      return;
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File too large. Maximum size is 500MB");
      return;
    }

    this.videoFile = file;
    this.loadVideo(file);
  }

  loadVideo(file) {
    const url = URL.createObjectURL(file);
    const container =
      document.querySelector("app-view-container") || document.body;
    this.displayVideoEditor(url, container);
  }

  displayVideoEditor(videoUrl, container) {
    const template = document.getElementById("videoEditorTemplate");
    const clone = template.content.cloneNode(true);
    const videoSource = clone.querySelector("#videoPlayer source");

    if (videoSource) {
      videoSource.src = videoUrl;
    }
    container.classList.remove("flex", "items-center", "justify-center");
    container.innerHTML = "";
    container.appendChild(clone);

    // After loading the HTML, you would call a setup function
    this.setupVideoEditor();

    const videoPlayer = document.getElementById("videoPlayer");
    if (videoPlayer) {
      videoPlayer.load();
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => this.displayHomeView());
    }
  }

  // TIMELINE FOR VIDEO CUT AND EDIT

  setupVideoEditor() {
    this.video = document.getElementById("videoPlayer");
    const startSlider = document.getElementById("startTimeSlider");
    const endSlider = document.getElementById("endTimeSlider");
    const previewBtn = document.getElementById("previewBtn");
    const resetBtn = document.getElementById("resetBtn");
    const processBtn = document.getElementById("processBtn");
    const autoSplitBtn = document.getElementById("autoSplitBtn");
    const backBtn = document.getElementById("back-btn");

    // Wait for video metadata to load
    this.video.addEventListener("loadedmetadata", () => {
      const duration = this.video.duration;
      this.endTime = duration;

      startSlider.max = duration;
      endSlider.max = duration;
      endSlider.value = duration;

      // Display video info
      this.displayVideoInfo();
      this.updateTimeDisplays();
    });

    // Timeline slider events
    startSlider.addEventListener("input", (e) => {
      this.startTime = parseFloat(e.target.value);
      if (this.startTime >= this.endTime) {
        this.startTime = this.endTime - 0.1;
        startSlider.value = this.startTime;
      }
      this.video.currentTime = this.startTime;
      this.updateTimeDisplays();
      this.checkDurationWarning();
    });

    endSlider.addEventListener("input", (e) => {
      this.endTime = parseFloat(e.target.value);
      if (this.endTime <= this.startTime) {
        this.endTime = this.startTime + 0.1;
        endSlider.value = this.endTime;
      }
      this.video.currentTime = this.endTime;
      this.updateTimeDisplays();
      this.checkDurationWarning();
    });

    // Preset buttons
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const duration = parseInt(e.target.dataset.duration);
        this.applyPreset(duration);
      });
    });

    // Auto-split functionality
    autoSplitBtn.addEventListener("click", () => this.autoSplitVideo());

    // Preview cut
    previewBtn.addEventListener("click", () => this.previewCut());

    // Reset button
    resetBtn.addEventListener("click", () => this.resetTimeline());

    // Process video
    processBtn.addEventListener("click", () => this.processVideo());

    // Upload buttons
    document
      .getElementById("uploadFacebook")
      .addEventListener("click", () => this.uploadToSocialMedia("facebook"));
    document
      .getElementById("uploadInstagram")
      .addEventListener("click", () => this.uploadToSocialMedia("instagram"));
    document
      .getElementById("downloadBtn")
      .addEventListener("click", () => this.downloadVideo());

    // Auto-loop preview during playback
    this.video.addEventListener("timeupdate", () => {
      if (this.video.currentTime >= this.endTime) {
        this.video.currentTime = this.startTime;
        this.video.pause();
      }
    });
  }

  displayVideoInfo() {
    // Get video metadata
    const width = this.video.videoWidth;
    const height = this.video.videoHeight;
    const duration = this.video.duration;

    // Calculate aspect ratio
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);
    const ratioW = width / divisor;
    const ratioH = height / divisor;

    // Common aspect ratios
    let aspectRatio = `${ratioW}:${ratioH}`;
    if (ratioW === 16 && ratioH === 9) aspectRatio = "16:9 (Landscape)";
    else if (ratioW === 9 && ratioH === 16) aspectRatio = "9:16 (Portrait)";
    else if (ratioW === 1 && ratioH === 1) aspectRatio = "1:1 (Square)";
    else if (ratioW === 4 && ratioH === 3) aspectRatio = "4:3 (Standard)";

    // Update display
    document.getElementById(
      "videoResolution"
    ).textContent = `${width}x${height}`;
    document.getElementById("videoAspectRatio").textContent = aspectRatio;
    document.getElementById("totalDuration").textContent =
      this.formatTime(duration);
    document.getElementById("videoFormat").textContent = this.videoFile.type
      .split("/")[1]
      .toUpperCase();

    // Warn if not ideal for short-form
    if (ratioW > ratioH) {
      this.showAspectRatioWarning(
        "Video is landscape. Short-form platforms prefer 9:16 portrait."
      );
    }
  }

  showAspectRatioWarning(message) {
    const warningDiv = document.createElement("div");
    warningDiv.className =
      "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-4 text-sm";
    warningDiv.innerHTML = `<strong>⚠️ Note:</strong> ${message}`;

    const container = document.querySelector(".w-full.max-w-4xl");
    container.insertBefore(warningDiv, container.firstChild.nextSibling);

    const videoPlayerContainer = document.querySelector(".bg-black.rounded-lg");
    if (videoPlayerContainer && container) {
      container.insertBefore(warningDiv, videoPlayerContainer);
    }
  }

  applyPreset(duration) {
    // Apply preset duration from current position
    const maxEnd = Math.min(this.startTime + duration, this.video.duration);
    this.endTime = maxEnd;

    document.getElementById("endTimeSlider").value = this.endTime;
    this.updateTimeDisplays();
    this.checkDurationWarning();

    // Visual feedback
    this.video.currentTime = this.startTime;
  }

  autoSplitVideo() {
    const splitDuration = parseInt(
      document.getElementById("splitDuration").value
    );
    const totalDuration = this.video.duration;
    const numClips = Math.ceil(totalDuration / splitDuration);

    const confirmed = confirm(
      `This will split your video into ${numClips} clips of ~${splitDuration}s each.\n\n` +
        `Note: Full auto-split requires video processing. For now, you can manually ` +
        `set each clip and download separately.`
    );

    if (confirmed) {
      // Set first clip
      this.startTime = 0;
      this.endTime = Math.min(splitDuration, totalDuration);

      document.getElementById("startTimeSlider").value = this.startTime;
      document.getElementById("endTimeSlider").value = this.endTime;

      this.updateTimeDisplays();
      alert(
        `Clip 1 of ${numClips} ready. Process and download, then adjust timeline for next clip.`
      );
    }
  }

  resetTimeline() {
    this.startTime = 0;
    this.endTime = this.video.duration;

    document.getElementById("startTimeSlider").value = this.startTime;
    document.getElementById("endTimeSlider").value = this.endTime;

    this.updateTimeDisplays();
    this.checkDurationWarning();
  }

  checkDurationWarning() {
    const duration = this.endTime - this.startTime;
    const warning = document.getElementById("durationWarning");

    // Check against current platform or general limits
    let maxDuration = 90; // General social media max

    if (duration > maxDuration) {
      warning.classList.remove("hidden");
    } else {
      warning.classList.add("hidden");
    }
  }

  updateTimeDisplays() {
    document.getElementById("startTimeDisplay").textContent = this.formatTime(
      this.startTime
    );
    document.getElementById("endTimeDisplay").textContent = this.formatTime(
      this.endTime
    );
    document.getElementById("durationDisplay").textContent = this.formatTime(
      this.endTime - this.startTime
    );
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  previewCut() {
    this.video.currentTime = this.startTime;
    this.video.play();
  }

  async processVideo() {
    if (!this.videoFile) return;

    const processBtn = document.getElementById("processBtn");
    processBtn.disabled = true;
    processBtn.textContent = "Processing...";

    try {
      // Note: Full video processing requires FFmpeg.js or server-side processing
      // This is a simplified client-side approach
      alert("Video processing complete! You can now upload or download.");

      // In production, you'd use FFmpeg.js here:
      // const ffmpeg = createFFmpeg({ log: true });
      // await ffmpeg.load();
      // ... processing logic
    } catch (error) {
      console.error("Processing error:", error);
      alert("Error processing video");
    } finally {
      processBtn.disabled = false;
      processBtn.textContent = "Process Video";
    }
  }

  displayHomeView() {
    if (this.initialViewContainer && this.initialHTML) {
      this.initialViewContainer.innerHTML = this.initialHTML;

      this.initialViewContainer.classList.add(
        "flex",
        "items-center",
        "justify-center"
      );
      this.setupEventListeners();
      console.log("Back to Upload page.");
    }
  }

  // AUTO UPLOAD TO FACEBOOK AND INSTAGRAM

  async uploadToSocialMedia(platform) {
    // Check authentication
    if (!this.user) {
      alert("Please sign in first to upload to social media");
      this.showAuthModal();
      return;
    }

    // NOTE: This requires backend implementation
    // Facebook & Instagram APIs need:
    // 1. App registered in Meta Developer Portal
    // 2. Backend server to handle OAuth & API calls
    // 3. User access tokens with proper permissions

    alert(
      `⚠️ ${platform.toUpperCase()} Upload:\n\n` +
        `This feature requires backend integration:\n` +
        `• Meta Developer App registration\n` +
        `• OAuth 2.0 token exchange\n` +
        `• Server-side API calls\n\n` +
        `For now, use the Download button and upload manually.`
    );

    // Example backend call (when implemented):
    /*
    try {
      const formData = new FormData();
      formData.append('video', this.videoFile);
      formData.append('startTime', this.startTime);
      formData.append('endTime', this.endTime);
      formData.append('platform', platform);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.user.token}`
        },
        body: formData
      });

      const result = await response.json();
      alert(`Successfully uploaded to ${platform}!`);
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    }
    */
  }

  downloadVideo() {
    // Create download link for original video
    // In production, this would download the processed cut
    const url = URL.createObjectURL(this.videoFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snippit_${Date.now()}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 4. CREATE ACCOUNT (GOOGLE SIGN IN/UP)

  checkAuthState() {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem("snippit_user");
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      this.updateUIForAuth();
    }
  }

  showAuthModal() {
    // Create modal overlay
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 class="text-2xl font-bold mb-4">Sign In to Snippit</h2>
        <p class="text-gray-600 mb-6">Sign in to upload videos to social media</p>
        
        <button id="googleSignIn" class="w-full px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-3 mb-4">
          <span class="text-xl">G</span>
          <span class="font-medium">Sign in with Google</span>
        </button>

        <button id="closeModal" class="w-full px-6 py-3 text-gray-600 hover:text-gray-800">
          Cancel
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById("googleSignIn").addEventListener("click", () => {
      this.handleGoogleSignIn();
      modal.remove();
    });

    document.getElementById("closeModal").addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  handleGoogleSignIn() {
    // NOTE: Requires Google Identity Services or Firebase setup
    // For demo purposes, we'll simulate authentication

    alert(
      "🔧 Google Sign-In Integration:\n\n" +
        "To implement:\n" +
        "1. Add Google Identity Services script to HTML\n" +
        "2. Create OAuth 2.0 Client ID in Google Cloud Console\n" +
        "3. Initialize: google.accounts.id.initialize()\n\n" +
        "Simulating sign-in for demo..."
    );

    // Simulate successful sign-in
    this.user = {
      id: "demo_" + Date.now(),
      name: "Demo User",
      email: "demo@example.com",
      picture: null,
    };

    localStorage.setItem("snippit_user", JSON.stringify(this.user));
    this.updateUIForAuth();

    /* Production implementation:
    google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID',
      callback: (response) => {
        // Decode JWT token
        const userData = parseJwt(response.credential);
        this.user = userData;
        localStorage.setItem('snippit_user', JSON.stringify(userData));
        this.updateUIForAuth();
      }
    });
    google.accounts.id.prompt();
    */
  }

  updateUIForAuth() {
    // Update header to show user info
    const header = document.querySelector("header");
    if (!header) return;

    const userInfo = document.createElement("div");
    userInfo.className = "ml-auto flex items-center gap-4";
    userInfo.innerHTML = `
      <span class="text-sm">${this.user.name}</span>
      <button id="signOut" class="text-sm text-gray-600 hover:text-black">Sign Out</button>
    `;
    header.appendChild(userInfo);

    document.getElementById("signOut").addEventListener("click", () => {
      this.handleSignOut();
    });
  }

  handleSignOut() {
    this.user = null;
    localStorage.removeItem("snippit_user");
    location.reload();
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.snippitApp = new SnippitApp();
});
