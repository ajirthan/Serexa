import { useState } from 'react';
import { MapPin, Upload, CheckCircle } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { uploadEvent } from '../services/upload';

const categories = ['Exhibition', 'Festivals', 'Entertainment', 'Education', 'Jobs'];

export default function PostEvent() {
  const [title, setTitle]           = useState('');
  const [location, setLocation]     = useState('');
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [autoDeleteDate, setAutoDeleteDate] = useState('');
  const [description, setDescription] = useState('');
  // FIX 15: Remove dead fields - district, releaseDate, tags
  const [selectedCats, setSelectedCats] = useState([]);
  const [image, setImage]           = useState(null);
  const [preview, setPreview]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  const toggleCat = (c) =>
    setSelectedCats(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPG, PNG, or WebP)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setError('');
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPG, PNG, or WebP)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setError('');
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!title) {
      setError('Event title is required');
      return;
    }
    if (!startDate) {
      setError('Start date is required');
      return;
    }
    if (!autoDeleteDate) {
      setError('Auto delete date is required');
      return;
    }
    
    // Validate end date
    if (endDate && new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date');
      return;
    }
    
    // FIX 15: Validate auto delete date
    if (new Date(autoDeleteDate) < new Date(startDate)) {
      setError('Auto delete date cannot be earlier than start date');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('date', startDate);
      if (endDate) formData.append('endDate', endDate);
      formData.append('autoDeleteDate', autoDeleteDate);
      formData.append('time', '');
      // FIX 15: Ensure category is appended
      formData.append('category', selectedCats.join(','));
      if (image) formData.append('image', image);

      await uploadEvent(formData);
      setSuccess(true);

      // Reset form
      setTitle(''); setLocation(''); setStartDate('');
      setEndDate(''); setAutoDeleteDate(''); setDescription(''); setSelectedCats([]);
      setImage(null); setPreview(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to publish event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar subtitle="" title="" />

      {/* Hero Title */}
      <div className="mb-6">
        <p className="text-[#FFE500] text-xs uppercase tracking-widest">
          Digital 3IL · Concierge
        </p>
        <h1 className="text-4xl font-bold text-white mt-1">
          Curate a{' '}
          <span className="text-[#FFE500] italic">
            New<br />Experience
          </span>
        </h1>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-md mb-4 flex items-center gap-2">
          <CheckCircle size={16} />
          Event published successfully!
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-8">
        <button
          onClick={() => {
            setTitle(''); setDescription('');
            setLocation(''); setStartDate('');
            setEndDate(''); setAutoDeleteDate(''); setSelectedCats([]);
            setImage(null); setPreview(null);
          }}
          className="px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-wide"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-[#FFE500] text-black text-sm font-bold rounded-md hover:bg-yellow-300 transition-colors uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          )}
          Publish Event
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">

        {/* Left Column */}
        <div className="space-y-6">

          {/* Title */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block">
              01 — Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter the grand title of your event..."
              className="w-full bg-[#141414] border border-[#333] text-white text-sm px-4 py-3 rounded-md focus:outline-none focus:border-[#FFE500] placeholder-gray-600 transition-colors"
            />
          </div>

          {/* Venue */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block">
              02 — The Venue
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Galle Face, Colombo..."
                className="w-full bg-[#141414] border border-[#333] text-white text-sm pl-9 pr-4 py-3 rounded-md focus:outline-none focus:border-[#FFE500] placeholder-gray-600 transition-colors"
              />
            </div>
          </div>

          {/* Temporal Frame */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 block">
              03 — Temporal Frame
            </label>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-400 mb-1.5 block font-medium">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                  className="w-full bg-[#141414] border border-[#333] text-gray-300 text-sm px-3 py-2.5 rounded-md focus:outline-none focus:border-[#FFE500] transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1.5 block font-medium">End Date (Optional)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333] text-gray-300 text-sm px-3 py-2.5 rounded-md focus:outline-none focus:border-[#FFE500] transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1.5 block font-medium">Auto Delete Date *</label>
                <input
                  type="date"
                  value={autoDeleteDate}
                  onChange={e => setAutoDeleteDate(e.target.value)}
                  required
                  className="w-full bg-[#141414] border border-[#333] text-gray-300 text-sm px-3 py-2.5 rounded-md focus:outline-none focus:border-[#FFE500] transition-colors"
                />
                <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                  On this date, the event and its image will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block">
              04 — Narrative Description
            </label>
            <textarea
              rows={7}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the soul of this experience..."
              className="w-full bg-[#141414] border border-[#333] text-white text-sm px-4 py-3 rounded-md focus:outline-none focus:border-[#FFE500] placeholder-gray-600 resize-none transition-colors"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Image Upload */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block">
              05 — Visual Anchor (Thumbnail)
            </label>
            <label
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className="w-full h-48 bg-[#141414] border-2 border-dashed border-[#333] rounded-md flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#FFE500] transition-colors group overflow-hidden relative"
            >
              {preview ? (
                <>
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs">Click to change image</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload size={24} className="text-gray-600 group-hover:text-[#FFE500] transition-colors" />
                  <p className="text-gray-600 text-xs text-center group-hover:text-gray-400 transition-colors">
                    Drag visual assets here<br />
                    <span className="text-[10px]">or click to browse</span>
                  </p>
                  <div className="text-[9px] text-gray-600 text-center mt-1 space-y-0.5">
                    <p className="text-gray-500">Recommended: 1200 × 800 px</p>
                    <p className="text-gray-600">Minimum: 800 × 500 px</p>
                    <p className="text-gray-600">Formats: JPG, PNG, WebP</p>
                    <p className="text-gray-600">Max size: 5MB</p>
                  </div>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImage}
                className="hidden"
              />
            </label>
          </div>

          {/* Publishing Settings */}
          <div className="bg-[#141414] border border-[#222] rounded-md p-4 space-y-4">
            <p className="text-[#FFE500] text-[10px] uppercase tracking-widest font-semibold">
              Publishing Settings
            </p>

            {/* Categories */}
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">
                Category Selection
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleCat(c)}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-all ${
                      selectedCats.includes(c)
                        ? 'bg-[#FFE500] text-black border-[#FFE500] font-medium'
                        : 'text-gray-400 border-[#333] hover:border-[#FFE500] hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}