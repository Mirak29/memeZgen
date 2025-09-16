import { useEffect, useRef, useState } from 'preact/hooks'

type TextItem = {
  id: number
  text: string
  fontSize: number
  color: string
  fontFamily: string
  position: 'top' | 'bottom' | 'center'
}

export function Editor() {
  const [texts, setTexts] = useState<TextItem[]>([
    {
      id: 1,
      text: 'Text Position 1',
      fontSize: 40,
      color: '#FFFFFF',
      fontFamily: 'Impact',
      position: 'top',
    },
    {
      id: 2,
      text: 'Text Position 2',
      fontSize: 40,
      color: '#FFFFFF',
      fontFamily: 'Impact',
      position: 'bottom',
    },
  ])
  const [showSettings, setShowSettings] = useState(false)
  const [editingTextId, setEditingTextId] = useState<number | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  const memeRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Get template from URL params
    const params = new URLSearchParams(window.location.search)
    const template = params.get('template')
    if (template) {
      setImageSrc(decodeURIComponent(template))
    }
  }, [])

  const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addText = () => {
    setTexts([
      ...texts,
      {
        id: Date.now(),
        text: 'New Text',
        fontSize: 40,
        color: '#FFFFFF',
        fontFamily: 'Impact',
        position: 'center',
      },
    ])
  }

  const updateText = (id: number, newText: string) => {
    const updatedTexts = []
    for (const t of texts) {
      if (t.id === id) {
        updatedTexts.push({ ...t, text: newText })
      } else {
        updatedTexts.push(t)
      }
    }
    setTexts(updatedTexts)
  }

  const deleteText = (id: number) => {
    setTexts(texts.filter((t) => t.id !== id))
  }

  const openSettingsFor = (id: number) => {
    setEditingTextId(id)
    setShowSettings(true)
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const closeSettings = () => {
    setShowSettings(false)
  }

  const updateTextProperty = (
    id: number,
    property: keyof TextItem,
    value: any,
  ) => {
    const updatedTexts = []
    for (const t of texts) {
      if (t.id === id) {
        updatedTexts.push({ ...t, [property]: value })
      } else {
        updatedTexts.push(t)
      }
    }
    setTexts(updatedTexts)
  }

  const handleDeleteAndClose = () => {
    if (textToEdit) {
      deleteText(textToEdit.id)
      setShowSettings(false)
    }
  }

  const downloadMeme = () => {
    // TODO: Implement canvas download
    alert('Download feature coming soon!')
  }

  const textToEdit = texts.find((t) => t.id === editingTextId)

  return (
    <div class='w-full flex flex-col lg:flex-row min-h-[calc(100vh-120px)]'>
      {/* Meme Canvas */}
      <div class='flex-grow flex items-center justify-center p-2 sm:p-4 lg:p-8 order-2 lg:order-1'>
        <div
          ref={memeRef}
          class='relative w-full max-w-lg aspect-square overflow-hidden bg-white rounded-lg shadow-lg border border-slate-200 flex items-center justify-center'
        >
          {imageSrc
            ? (
              <>
                <img
                  src={imageSrc}
                  alt='Meme template'
                  class='w-full h-full object-contain'
                />
                {texts.map((textItem) => (
                  <DraggableText
                    key={textItem.id}
                    textItem={textItem}
                    onDelete={deleteText}
                  />
                ))}
              </>
            )
            : (
              <div class='text-center text-slate-400 p-8'>
                <h3 class='text-xl font-semibold mb-2'>MemeZgen</h3>
                <p class='text-sm'>
                  Select a template or upload your own image to start creating.
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Sidebar */}
      <div class='w-full lg:w-80 bg-white/95 backdrop-blur-sm p-3 sm:p-6 flex flex-col gap-4 order-1 lg:order-2 border-l border-slate-200'>
        <h2 class='text-xl sm:text-2xl font-bold text-center text-slate-800'>
          Edit Your Meme
        </h2>

        <div class='grid grid-cols-2 gap-3'>
          {/* Upload image */}
          <button
            type='button'
            onClick={handleUpload}
            class='btn bg-white border-slate-200 text-slate-700 hover:border-cyan-400 hover:bg-cyan-50'
          >
            <svg
              class='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
              />
            </svg>
            Upload
          </button>

          {/* Add text */}
          <button
            type='button'
            onClick={addText}
            class='btn bg-white border-slate-200 text-slate-700 hover:border-cyan-400 hover:bg-cyan-50'
          >
            <svg
              class='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              />
            </svg>
            Add Text
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleImageUpload}
          class='hidden'
        />

        {/* Text editor list */}
        <div class='flex flex-col gap-3'>
          {texts.map((textItem, index) => (
            <div
              key={textItem.id}
              class='flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm'
            >
              <input
                type='text'
                value={textItem.text}
                onChange={(e) =>
                  updateText(textItem.id, (e.target as HTMLInputElement).value)}
                class='flex-grow input input-sm bg-white text-slate-800 placeholder-slate-400 border-slate-200 focus:border-cyan-400'
                placeholder={`Text position ${index + 1}`}
              />
              <button
                type='button'
                onClick={() => openSettingsFor(textItem.id)}
                class='btn btn-ghost btn-sm text-slate-500 hover:text-slate-700'
              >
                <svg
                  class='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                  />
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Download button */}
        <div class='flex flex-col gap-3 mt-auto'>
          <button
            type='button'
            onClick={downloadMeme}
            class='btn btn-primary w-full'
          >
            <svg
              class='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && textToEdit && (
        <div class='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div class='bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-slate-200 shadow-xl'>
            <div class='flex justify-between items-center mb-4'>
              <h3 class='text-xl font-bold text-slate-800'>Edit Text</h3>
              <button
                type='button'
                onClick={closeSettings}
                class='btn btn-ghost btn-sm text-slate-500 hover:text-slate-700'
              >
                <svg
                  class='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <div class='space-y-4'>
              <div class='form-control'>
                <label class='label'>
                  <span class='label-text text-slate-700'>
                    Font Size: {textToEdit.fontSize}px
                  </span>
                </label>
                <input
                  type='range'
                  min='20'
                  max='100'
                  step='2'
                  value={textToEdit.fontSize}
                  onChange={(e) =>
                    updateTextProperty(
                      textToEdit.id,
                      'fontSize',
                      parseInt((e.target as HTMLInputElement).value),
                    )}
                  class='range range-primary'
                />
              </div>

              <div class='form-control'>
                <label class='label'>
                  <span class='label-text text-slate-700'>Text Color</span>
                </label>
                <input
                  type='color'
                  value={textToEdit.color}
                  onChange={(e) =>
                    updateTextProperty(
                      textToEdit.id,
                      'color',
                      (e.target as HTMLInputElement).value,
                    )}
                  class='input input-bordered w-full h-12'
                />
              </div>

              <button
                type='button'
                onClick={handleDeleteAndClose}
                class='btn btn-error w-full'
              >
                Delete Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DraggableText({ textItem, onDelete }: {
  textItem: TextItem
  onDelete: (id: number) => void
}) {
  const getPositionStyle = () => {
    switch (textItem.position) {
      case 'top':
        return { top: '10%', left: '50%' }
      case 'bottom':
        return { top: '85%', left: '50%' }
      case 'center':
        return { top: '50%', left: '50%' }
      default: {
        const _: never = textItem.position
        return { top: '50%', left: '50%' }
      }
    }
  }

  const textStyle = {
    fontFamily: 'Impact, sans-serif',
    color: textItem.color,
    fontSize: `${textItem.fontSize}px`,
    textShadow:
      '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
    textAlign: 'center' as const,
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  }

  return (
    <div
      class='absolute cursor-move group select-none'
      style={{
        ...getPositionStyle(),
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div class='relative p-2'>
        <h1 style={textStyle}>
          {textItem.text}
        </h1>
        <button
          type='button'
          onClick={() => onDelete(textItem.id)}
          class='absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs'
          title='Delete text'
        >
          ×
        </button>
      </div>
    </div>
  )
}
