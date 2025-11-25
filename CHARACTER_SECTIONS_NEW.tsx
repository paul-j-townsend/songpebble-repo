      {/* To Characters Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              To <span className="text-gray-400 text-sm font-normal">(recipients - optional)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Add up to 8 recipients to personalize your song
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {toCharacterFields.length}/8
            </span>
            <button
              type="button"
              onClick={() => {
                const newIndex = toCharacterFields.length
                appendToCharacter({
                  characterName: '',
                  characterGender: undefined,
                  characterInterests: '',
                  characterMention: '',
                })
                setExpandedToCharacters((prev) => {
                  const newSet = new Set(prev)
                  newSet.add(newIndex)
                  return newSet
                })
              }}
              disabled={toCharacterFields.length >= 8}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Recipient
            </button>
          </div>
        </div>

        {toCharacterFields.length === 0 && (
          <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600 font-medium">No recipients added yet</p>
            <p className="text-gray-500 text-sm mt-1">Click "Add Recipient" to personalize the song</p>
          </div>
        )}

        <div className="space-y-4">
          {toCharacterFields.map((field, index) => {
            const isExpanded = expandedToCharacters.has(index)
            const characterName = formValues.toCharacters?.[index]?.characterName || `Recipient ${index + 1}`

            return (
              <div key={field.id} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                {/* Character Card Header */}
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleToCharacter(index)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-transform"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-700 truncate">
                        {characterName}
                      </h4>
                      {!isExpanded && formValues.toCharacters?.[index]?.characterGender && (
                        <p className="text-xs text-gray-500 capitalize">
                          {formValues.toCharacters[index].characterGender}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeToCharacter(index)
                      // Adjust expanded state
                      setExpandedToCharacters((prev) => {
                        const newSet = new Set<number>()
                        prev.forEach((i) => {
                          if (i < index) {
                            newSet.add(i)
                          } else if (i > index) {
                            newSet.add(i - 1)
                          }
                        })
                        return newSet
                      })
                    }}
                    className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors ml-2"
                    title="Remove recipient"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Character Details (Collapsible) */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 space-y-3 border-t border-slate-200">
                {/* Character Name */}
                <div>
                  <label htmlFor={`toCharacters.${index}.characterName`} className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`toCharacters.${index}.characterName`}
                    type="text"
                    {...register(`toCharacters.${index}.characterName` as const)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., Sarah, John, etc."
                  />
                  {errors.toCharacters?.[index]?.characterName && (
                    <p className="mt-1 text-xs text-red-600">{errors.toCharacters[index]?.characterName?.message}</p>
                  )}
                </div>

                {/* Character Gender */}
                <div>
                  <label htmlFor={`toCharacters.${index}.characterGender`} className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <select
                    id={`toCharacters.${index}.characterGender`}
                    {...register(`toCharacters.${index}.characterGender` as const)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  >
                    <option value="">Select gender...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.toCharacters?.[index]?.characterGender && (
                    <p className="mt-1 text-xs text-red-600">{errors.toCharacters[index]?.characterGender?.message}</p>
                  )}
                </div>

                {/* Character Interests */}
                <div>
                  <label htmlFor={`toCharacters.${index}.characterInterests`} className="block text-sm font-medium text-gray-700 mb-1">
                    Interests <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    id={`toCharacters.${index}.characterInterests`}
                    {...register(`toCharacters.${index}.characterInterests` as const)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm"
                    placeholder="e.g., loves hiking, plays guitar, enjoys cooking..."
                  />
                  {errors.toCharacters?.[index]?.characterInterests && (
                    <p className="mt-1 text-xs text-red-600">{errors.toCharacters[index]?.characterInterests?.message}</p>
                  )}
                </div>

                {/* One Thing to Mention */}
                <div>
                  <label htmlFor={`toCharacters.${index}.characterMention`} className="block text-sm font-medium text-gray-700 mb-1">
                    One Thing to Mention <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    id={`toCharacters.${index}.characterMention`}
                    {...register(`toCharacters.${index}.characterMention` as const)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm"
                    placeholder="e.g., always smiles when it rains, has a unique laugh..."
                  />
                  {errors.toCharacters?.[index]?.characterMention && (
                    <p className="mt-1 text-xs text-red-600">{errors.toCharacters[index]?.characterMention?.message}</p>
                  )}
                </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {errors.toCharacters && typeof errors.toCharacters === 'object' && !Array.isArray(errors.toCharacters) && (
          <p className="mt-2 text-sm text-red-600">{errors.toCharacters.message}</p>
        )}
      </div>

      {/* Senders Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              From <span className="text-gray-400 text-sm font-normal">(senders - optional)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Add up to 8 senders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {senderFields.length}/8
            </span>
            <button
              type="button"
              onClick={() => {
                const newIndex = senderFields.length
                appendSender({
                  senderName: '',
                })
                setExpandedSenders((prev) => {
                  const newSet = new Set(prev)
                  newSet.add(newIndex)
                  return newSet
                })
              }}
              disabled={senderFields.length >= 8}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Sender
            </button>
          </div>
        </div>

        {senderFields.length === 0 && (
          <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-gray-600 font-medium">No senders added yet</p>
            <p className="text-gray-500 text-sm mt-1">Click "Add Sender" to specify who the song is from</p>
          </div>
        )}

        <div className="space-y-4">
          {senderFields.map((field, index) => {
            const isExpanded = expandedSenders.has(index)
            const senderName = formValues.senders?.[index]?.senderName || `Sender ${index + 1}`

            return (
              <div key={field.id} className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                {/* Sender Card Header */}
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-green-100 transition-colors" onClick={() => toggleSender(index)}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-transform"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-700 truncate">
                        {senderName}
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSender(index)
                      // Adjust expanded state
                      setExpandedSenders((prev) => {
                        const newSet = new Set<number>()
                        prev.forEach((i) => {
                          if (i < index) {
                            newSet.add(i)
                          } else if (i > index) {
                            newSet.add(i - 1)
                          }
                        })
                        return newSet
                      })
                    }}
                    className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors ml-2"
                    title="Remove sender"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Sender Details (Collapsible) */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-green-200">
                {/* Sender Name */}
                <div>
                  <label htmlFor={`senders.${index}.senderName`} className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`senders.${index}.senderName`}
                    type="text"
                    {...register(`senders.${index}.senderName` as const)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    placeholder="e.g., Mom and Dad, Grandma, etc."
                  />
                  {errors.senders?.[index]?.senderName && (
                    <p className="mt-1 text-xs text-red-600">{errors.senders[index]?.senderName?.message}</p>
                  )}
                </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {errors.senders && typeof errors.senders === 'object' && !Array.isArray(errors.senders) && (
          <p className="mt-2 text-sm text-red-600">{errors.senders.message}</p>
        )}
      </div>
