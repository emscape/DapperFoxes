# Plan: Integrate Official Photos into Gallery (Static Approach)

**Objective:** Add photos from the `images/wedding website/` directory to the photo gallery on `photos.html`, displaying them below the dynamically loaded guest photos. This plan uses a static integration method, managing the photos directly within the project repository.

**Phase 1: Manual Preparation (Action for Emily)**

1.  **Identify Incompatible Files:** Go through the `images/wedding website/` directory and list all files ending in `.HEIC`.
2.  **Convert HEIC Files:** Use an image editor or an online conversion tool to convert each `.HEIC` file into either `.JPG` or `.PNG` format.
3.  **Save Converted Files:** Place the newly converted JPG/PNG files back into the `images/wedding website/` directory.
4.  **(Optional but Recommended) Optimize Images:** Consider using a tool (like TinyPNG/TinyJPG online, or image editing software) to optimize *all* the JPG, JPEG, and PNG files in the folder for web use. This reduces their file size, making the gallery load faster for visitors, without noticeably sacrificing quality.
5.  **Note Video Files:** The `.MP4` files in the directory will be ignored for this task, as we are focusing on the *photo* gallery.

*   **Emily, please confirm when these preparation steps are complete before proceeding to implementation.**

**Phase 2: Code Implementation (To be done in Code Mode)**

1.  **Target Files:** `photos.html`, `js/main.js`, `css/main.css`.
2.  **Update HTML (`photos.html`):**
    *   Locate the container for guest photos (e.g., `#guest-photo-gallery`).
    *   Add a new container (`#official-photo-gallery`) directly after it, potentially with a heading/separator.
        ```html
        <!-- Existing guest photo container -->
        <div id="guest-photo-gallery" class="photo-gallery">
            <!-- Guest photos load here -->
        </div>

        <!-- Add a heading/separator if desired -->
        <h2>Our Photos</h2>
        <hr>

        <!-- New container for official photos -->
        <div id="official-photo-gallery" class="photo-gallery">
            <!-- Official photos will be loaded here by JavaScript -->
        </div>
        ```
3.  **Update JavaScript (`js/main.js`):**
    *   **Create Photo List:** Define a JavaScript array (`officialPhotoPaths`) containing the relative paths of all usable image files in `images/wedding website/`.
    *   **Create Loading Function:** Implement `loadOfficialPhotos()` to get `#official-photo-gallery`, loop through `officialPhotoPaths`, create gallery item HTML (`<div><img></div>`), and append to the container.
    *   **Integrate Loading:** Call `loadOfficialPhotos()` after guest photos have loaded.
    *   **Update Lightbox:** Ensure the global `galleryPhotos` array includes data for both guest and official photos. Update click listeners and navigation functions (`showNextPhoto`, `showPreviousPhoto`) to work correctly with the combined list.
4.  **Update CSS (`css/main.css`):**
    *   Ensure consistent styling for `#official-photo-gallery` and its contents, matching the guest gallery.

**Phase 3: Testing (To be done in Test Mode or Manually)**

1.  Load `photos.html`.
2.  Confirm both guest and official photos display correctly (official below guest).
3.  Test lightbox opening and navigation through *all* photos.
4.  Check responsiveness on different screen sizes.

**Visual Plan (Mermaid Diagram):**

```mermaid
graph TD
    A[Start: Add Official Photos] --> B(Emily: Convert HEIC & Optimize);
    B --> C[Code Mode: Modify photos.html - Add Container];
    C --> D[Code Mode: Modify js/main.js - Create Photo List & Load Function];
    D --> E[Code Mode: Modify js/main.js - Integrate Loading];
    E --> F[Code Mode: Modify js/main.js - Update Lightbox Logic];
    F --> G[Code Mode: Modify css/main.css - Adjust Styles];
    G --> H{Testing: Verify Display & Lightbox};
    H -- Pass --> I[End: Photos Integrated];
    H -- Fail --> C;

    subgraph Manual Preprocessing
        B
    end

    subgraph Code Implementation (Static)
        C --- D --- E --- F --- G
    end

    subgraph Testing
        H
    end

    style B fill:#f9f,stroke:#333,stroke-width:2px