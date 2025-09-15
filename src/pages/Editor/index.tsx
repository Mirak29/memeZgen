export function Editor() {
  return (
    <div class='container mx-auto px-4 py-8'>
      <div class='grid lg:grid-cols-2 gap-8'>
        <div class='space-y-6'>
          <h1 class='text-3xl font-bold'>Meme Editor</h1>

          <MemeCanvas />
        </div>

        <div class='space-y-6'>
          <TextControls />
          <ExportControls />
        </div>
      </div>
    </div>
  )
}

function MemeCanvas() {
  return (
    <div class='card bg-base-100 shadow-xl'>
      <div class='card-body'>
        <h2 class='card-title'>Preview</h2>
        <div class='bg-base-200 aspect-square rounded-lg flex items-center justify-center'>
          <canvas
            id='memeCanvas'
            width='400'
            height='400'
            class='max-w-full max-h-full border border-base-300 rounded'
          >
          </canvas>
        </div>
      </div>
    </div>
  )
}

function TextControls() {
  return (
    <div class='card bg-base-100 shadow-xl'>
      <div class='card-body'>
        <h2 class='card-title'>Text Settings</h2>

        <div class='form-control'>
          <label class='label'>
            <span class='label-text'>Top Text</span>
          </label>
          <input
            type='text'
            placeholder='Enter top text...'
            class='input input-bordered w-full'
          />
        </div>

        <div class='form-control'>
          <label class='label'>
            <span class='label-text'>Bottom Text</span>
          </label>
          <input
            type='text'
            placeholder='Enter bottom text...'
            class='input input-bordered w-full'
          />
        </div>

        <div class='grid grid-cols-2 gap-4'>
          <div class='form-control'>
            <label class='label'>
              <span class='label-text'>Font Size</span>
            </label>
            <select class='select select-bordered'>
              <option>24px</option>
              <option selected>32px</option>
              <option>48px</option>
              <option>64px</option>
            </select>
          </div>

          <div class='form-control'>
            <label class='label'>
              <span class='label-text'>Text Color</span>
            </label>
            <input
              type='color'
              value='#ffffff'
              class='input input-bordered h-12'
            />
          </div>
        </div>

        <div class='form-control'>
          <label class='label cursor-pointer'>
            <span class='label-text'>Bold Text</span>
            <input type='checkbox' class='toggle toggle-primary' />
          </label>
        </div>
      </div>
    </div>
  )
}

function ExportControls() {
  return (
    <div class='card bg-base-100 shadow-xl'>
      <div class='card-body'>
        <h2 class='card-title'>Export</h2>

        <div class='space-y-4'>
          <button type='button' class='btn btn-primary w-full'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              class='h-5 w-5 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            Download PNG
          </button>

          <button type='button' class='btn btn-outline w-full'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              class='h-5 w-5 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
              />
            </svg>
            Share Link
          </button>

          <button type='button' class='btn btn-ghost w-full'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              class='h-5 w-5 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
              />
            </svg>
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
