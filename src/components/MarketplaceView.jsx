import React, { useState } from 'react';
import { Search, Plus, MessageCircle, ShieldCheck, Tag, MapPin, X } from 'lucide-react';

export default function MarketplaceView({ 
  items, 
  setItems, 
  currentUser, 
  onStartChatWithSeller 
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // New listing form state
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Textbooks');
  const [newCondition, setNewCondition] = useState('Like New');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const categories = ['All', 'Textbooks', 'Tech', 'Dorm Gear', 'Tickets', 'Clothing'];

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateListing = (e) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const newItem = {
      id: 'item_' + Date.now(),
      sellerId: currentUser.uid,
      sellerName: currentUser.displayName,
      sellerAvatar: currentUser.avatarUrl,
      sellerSchoolId: currentUser.schoolId,
      sellerSchoolName: currentUser.schoolName.split(' ')[0],
      isVerifiedSeller: currentUser.isVerifiedSchool,
      title: newTitle,
      price: parseFloat(newPrice),
      category: newCategory,
      condition: newCondition,
      description: newDesc || 'No description provided.',
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
      location: newLocation || currentUser.schoolName + ' Yard',
      status: 'available',
      createdAt: 'Just now'
    };

    setItems([newItem, ...items]);
    setIsSellModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '16px 12px 24px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header & Sell Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
            Student Marketplace 🛒
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Buy, sell, and trade safely on campus</p>
        </div>

        <button 
          onClick={() => setIsSellModalOpen(true)}
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '12px' }}
        >
          <Plus size={16} />
          <span>Sell Item</span>
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text"
          placeholder="Search textbooks, iPads, mini-fridges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-styled"
          style={{ paddingLeft: '38px', borderRadius: 'var(--radius-full)' }}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Scroll Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: '600',
              border: selectedCategory === cat ? 'none' : '1px solid var(--border-color)',
              background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
              color: selectedCategory === cat ? 'white' : 'var(--text-main)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2-Column Marketplace Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedItemDetail(item)}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            {/* Image Container w/ Price Pill */}
            <div style={{ position: 'relative', height: '140px', width: '100%', background: 'var(--bg-subtle)' }}>
              <img 
                src={item.imageUrl} 
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(4px)',
                color: 'white',
                fontWeight: '800',
                fontSize: '13px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)'
              }}>
                ${item.price.toFixed(2)}
              </span>
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: '700',
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}>
                {item.condition}
              </span>
            </div>

            {/* Content Details */}
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', lineHeight: '1.3', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>🏫 {item.sellerSchoolName}</span>
                </div>
                {item.isVerifiedSeller && (
                  <ShieldCheck size={14} color="#10B981" title="Verified Student Seller" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Modal */}
      {selectedItemDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end'
        }}>
          <div className="animate-slide-up" style={{
            width: '100%',
            maxWidth: '480px',
            background: 'var(--bg-card)',
            borderTopLeftRadius: 'var(--radius-xl)',
            borderTopRightRadius: 'var(--radius-xl)',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="btn-secondary" style={{ fontSize: '11px' }}>{selectedItemDetail.category}</span>
              <button onClick={() => setSelectedItemDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '220px' }}>
              <img src={selectedItemDetail.imageUrl} alt={selectedItemDetail.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{selectedItemDetail.title}</h2>
                <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>${selectedItemDetail.price.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={14} /> Condition: {selectedItemDetail.condition}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} /> {selectedItemDetail.location}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-main)', background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              {selectedItemDetail.description}
            </p>

            {/* Seller Info & Action */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={selectedItemDetail.sellerAvatar} alt={selectedItemDetail.sellerName} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {selectedItemDetail.sellerName}
                    {selectedItemDetail.isVerifiedSeller && <ShieldCheck size={12} color="#10B981" />}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedItemDetail.sellerSchoolName}</div>
                </div>
              </div>

              <button 
                onClick={() => {
                  const seller = {
                    uid: selectedItemDetail.sellerId,
                    displayName: selectedItemDetail.sellerName,
                    avatarUrl: selectedItemDetail.sellerAvatar,
                    schoolName: selectedItemDetail.sellerSchoolName
                  };
                  onStartChatWithSeller(seller, selectedItemDetail);
                  setSelectedItemDetail(null);
                }}
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                <MessageCircle size={14} />
                <span>Chat Seller</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Item Modal */}
      {isSellModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <form 
            onSubmit={handleCreateListing}
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>List an Item on Marketplace</h3>
              <button type="button" onClick={() => setIsSellModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Item Title</label>
              <input type="text" placeholder="e.g. Calculus 8th Edition Textbook" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="input-styled" />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Price ($)</label>
                <input type="number" placeholder="45.00" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="input-styled" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Category</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input-styled">
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Description</label>
              <textarea placeholder="Describe condition, pickup spot, etc." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="input-styled" style={{ height: '70px', resize: 'none' }} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '6px' }}>
              Publish Listing 🚀
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
