/**
 * Phase 3 End-to-End Tests
 * Automated browser testing of the complete matching system
 */

import { test, expect } from '@playwright/test'

test.describe('Phase 3: Complete Matching System E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/matching/preferences', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          preferences: {
            user_id: 'test-user',
            max_detour_minutes: 15,
            preferred_group_size: 4,
            driver_preference: 'flexible',
            schedule_flexibility_minutes: 30,
            max_pickup_distance_miles: 5,
            min_compatibility_score: 0.7,
            notification_preferences: { email: true, push: true, sms: false },
            user_demographics: {
              age_range: '26-35',
              gender: 'male',
              occupation: 'Software Engineer',
              student_status: 'not_student',
              company: 'Tech Corp'
            },
            demographic_preferences: {
              age_preferences: ['26-35', '36-45'],
              gender_preferences: ['any'],
              student_preference: 'both',
              occupation_preferences: []
            },
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        })
      })
    })

    await page.route('**/api/matching/potential-matches**', async route => {
      const url = new URL(route.request().url())
      const minScore = url.searchParams.get('min_score')
      const maxDistance = url.searchParams.get('max_distance')
      const ageRanges = url.searchParams.get('age_ranges')
      
      // Simulate filtered results based on query params
      let matches = [
        {
          id: '1',
          compatibility_score: 85,
          route_overlap_percentage: 75,
          estimated_pickup_distance_miles: 2.5,
          match_reasons: ['Same destination', 'Similar schedule'],
          user2: {
            id: 'user2',
            name: 'John Doe',
            display_name: 'John',
            home_location: { lat: 37.7749, lng: -122.4194 },
            work_location: { lat: 37.7849, lng: -122.4094 },
            schedule: {
              work_start_time: '09:00',
              work_end_time: '17:00',
              work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            }
          }
        },
        {
          id: '2',
          compatibility_score: 78,
          route_overlap_percentage: 65,
          estimated_pickup_distance_miles: 3.2,
          match_reasons: ['Close pickup location', 'Flexible schedule'],
          user2: {
            id: 'user3',
            name: 'Jane Smith',
            display_name: 'Jane',
            home_location: { lat: 37.7849, lng: -122.4094 },
            work_location: { lat: 37.7949, lng: -122.3994 },
            schedule: {
              work_start_time: '08:30',
              work_end_time: '16:30',
              work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            }
          }
        }
      ]

      // Apply filters
      if (minScore) {
        matches = matches.filter(m => m.compatibility_score >= parseInt(minScore))
      }
      if (maxDistance) {
        matches = matches.filter(m => m.estimated_pickup_distance_miles <= parseFloat(maxDistance))
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          pending_matches: matches,
          accepted_matches: [],
          expired_matches: []
        })
      })
    })

    await page.route('**/api/matching/requests', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          incoming: [
            {
              id: 'req1',
              from_user_id: 'user4',
              to_user_id: 'test-user',
              potential_match_id: '1',
              message: 'Hi! I\'d love to carpool with you.',
              status: 'pending',
              expires_at: '2024-01-08T00:00:00Z',
              created_at: '2024-01-01T00:00:00Z',
              from_user: {
                id: 'user4',
                name: 'Alice Johnson',
                display_name: 'Alice'
              }
            }
          ],
          outgoing: []
        })
      })
    })

    await page.route('**/api/matching/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_matches_generated: 15,
          match_acceptance_rate: 0.75,
          average_compatibility_score: 0.82,
          total_carpools_formed: 8,
          total_savings: 450.50,
          average_route_overlap: 78.5,
          most_common_match_reasons: [
            'Same destination',
            'Similar schedule',
            'Close pickup location'
          ],
          geographic_distribution: {
            nearby: 12,
            medium_distance: 8,
            far: 5
          },
          time_to_acceptance: 2.3,
          monthly_trends: [
            { month: 'Oct', matches: 5, acceptances: 3 },
            { month: 'Nov', matches: 8, acceptances: 6 },
            { month: 'Dec', matches: 12, acceptances: 7 },
            { month: 'Jan', matches: 10, acceptances: 8 }
          ]
        })
      })
    })

    await page.route('**/api/matching/find-matches', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          matches_found: 5,
          message: 'Matches generated successfully'
        })
      })
    })

    // Mock Clerk authentication
    await page.addInitScript(() => {
      (window as any).Clerk = {
        user: {
          id: 'test-user-id',
          firstName: 'Test',
          lastName: 'User',
          emailAddresses: [{ emailAddress: 'test@example.com' }]
        },
        isLoaded: true,
        isSignedIn: true
      }
    })
  })

  test('loads matching page with all components', async ({ page }) => {
    // Navigate to matching page
    await page.goto('/matching')

    // Check page loads by verifying the main heading instead of title
    await expect(page.getByRole('heading', { name: 'Matching' })).toBeVisible()
    
    // Check all tabs are present using role-based locators
    await expect(page.getByRole('tab', { name: 'Potential' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Requests' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Algorithm' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Real-time' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Statistics' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Preferences' })).toBeVisible()

    // Check header counts
    await expect(page.getByText('2')).toBeVisible() // potential matches
    await expect(page.getByText('1')).toBeVisible() // incoming requests
    await expect(page.getByText('8')).toBeVisible() // formed carpools
    await expect(page.getByText('$450.50')).toBeVisible() // savings
  })

  test('filter system works end-to-end', async ({ page }) => {
    await page.goto('/matching')

    // Show filters
    await page.getByText('Show Filters').click()
    await expect(page.getByText('Advanced Filters')).toBeVisible()

    // Apply basic filters
    await page.getByPlaceholder('e.g. 70').fill('80')
    await page.getByPlaceholder('e.g. 10').fill('5')

    // Wait for debounced API call
    await page.waitForTimeout(600)

    // Expand advanced filters
    await page.getByText('Expand').click()
    await expect(page.getByText('Age Ranges')).toBeVisible()

    // Select age ranges
    await page.getByLabel('26-35').check()
    await page.getByLabel('36-45').check()

    // Wait for API call
    await page.waitForTimeout(600)

    // Check filter badges appear
    await expect(page.getByText('Score ≥ 80%')).toBeVisible()
    await expect(page.getByText('Distance ≤ 5mi')).toBeVisible()
    await expect(page.getByText('Ages: 26-35, 36-45')).toBeVisible()

    // Test clear all
    await page.getByText('Clear All').click()
    await expect(page.getByText('Score ≥ 80%')).not.toBeVisible()
  })

  test('filter presets work correctly', async ({ page }) => {
    await page.goto('/matching')

    await page.getByText('Show Filters').click()
    await page.getByText('Expand').click()

    // Use High Compatibility preset
    await page.getByText('High Compatibility').click()
    await page.waitForTimeout(600)

    // Check preset was applied
    await expect(page.getByText('Score ≥ 80%')).toBeVisible()
    await expect(page.getByText('Distance ≤ 5mi')).toBeVisible()
    await expect(page.getByText('Ages: 26-35, 36-45')).toBeVisible()
  })

  test('potential matches display correctly', async ({ page }) => {
    await page.goto('/matching')

    // Check matches are displayed
    await expect(page.getByText('John Doe')).toBeVisible()
    await expect(page.getByText('Jane Smith')).toBeVisible()
    await expect(page.getByText('85%')).toBeVisible() // compatibility score
    await expect(page.getByText('2.5 mi')).toBeVisible() // distance

    // Test navigation
    await page.getByText('Next').click()
    await expect(page.getByText('2 of 2')).toBeVisible()

    await page.getByText('Back').click()
    await expect(page.getByText('1 of 2')).toBeVisible()
  })

  test('requests tab works correctly', async ({ page }) => {
    await page.goto('/matching')
    await page.getByText('Requests').click()
    
    // Check incoming requests
    await expect(page.getByText('Alice Johnson')).toBeVisible()
    await expect(page.getByText('Hi! I\'d love to carpool with you.')).toBeVisible()

    // Test accept/reject (if buttons are present)
    const acceptButton = page.getByText('Accept').first()
    if (await acceptButton.isVisible()) {
      await acceptButton.click()
    }
  })

  test('algorithm tab works correctly', async ({ page }) => {
    await page.goto('/matching')
    await page.getByText('Algorithm').click()
    
    // Check algorithm overview
    await expect(page.getByText('Smart Matching Algorithm')).toBeVisible()
    await expect(page.getByText('Location Compatibility')).toBeVisible()
    await expect(page.getByText('Schedule Compatibility')).toBeVisible()

    // Test match generation
    await page.getByText('Generate Matches').click()
    
    // Check loading state
    await expect(page.getByText('Generating...')).toBeVisible()
    
    // Wait for completion
    await expect(page.getByText('Found 5 new matches!')).toBeVisible()
  })

  test('real-time tab works correctly', async ({ page }) => {
    await page.goto('/matching')
    await page.getByText('Real-time').click()
    
    // Check real-time controls
    await expect(page.getByText('Real-time Updates')).toBeVisible()
    await expect(page.getByText('Enable real-time updates')).toBeVisible()
    await expect(page.getByText('15s')).toBeVisible()
    await expect(page.getByText('30s')).toBeVisible()
    await expect(page.getByText('1m')).toBeVisible()

    // Enable updates
    await page.getByRole('switch').click()
    
    // Test manual refresh
    await page.getByText('Refresh Now').click()
  })

  test('statistics tab displays correctly', async ({ page }) => {
    await page.goto('/matching')
    await page.getByText('Statistics').click()
    
    // Check stats are displayed
    await expect(page.getByText('Matching Statistics')).toBeVisible()
    await expect(page.getByText('15')).toBeVisible() // total matches
    await expect(page.getByText('75%')).toBeVisible() // acceptance rate
    await expect(page.getByText('82%')).toBeVisible() // avg compatibility
  })

  test('preferences tab works correctly', async ({ page }) => {
    await page.goto('/matching')
    await page.getByText('Preferences').click()
    
    // Check preferences form
    await expect(page.getByText('Matching Preferences')).toBeVisible()
    await expect(page.getByText('Max Detour Minutes')).toBeVisible()
    await expect(page.getByText('Preferred Group Size')).toBeVisible()
  })

  test('handles empty states correctly', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/matching/potential-matches**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          pending_matches: [],
          accepted_matches: [],
          expired_matches: []
        })
      })
    })

    await page.goto('/matching')
    
    // Check empty state
    await expect(page.getByText('No matches found')).toBeVisible()
    await expect(page.getByText('We couldn\'t find any compatible carpool partners')).toBeVisible()
  })

  test('handles API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/matching/potential-matches**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })

    await page.goto('/matching')
    
    // Should handle error gracefully
    await expect(page.getByText('No matches found')).toBeVisible()
  })

  test('performance with rapid filter changes', async ({ page }) => {
    await page.goto('/matching')

    await page.getByText('Show Filters').click()
    
    const minScoreInput = page.getByPlaceholder('e.g. 70')
    
    // Rapidly change input
    for (let i = 1; i <= 5; i++) {
      await minScoreInput.fill(i.toString())
      await page.waitForTimeout(50)
    }

    // Should only make one final API call due to debouncing
    await page.waitForTimeout(600)
    
    // Check final value was applied
    await expect(minScoreInput).toHaveValue('5')
  })

  test('mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/matching')
    
    // Check page still loads
    await expect(page.getByText('Potential Matches')).toBeVisible()
    
    // Check filters work on mobile
    await page.getByText('Show Filters').click()
    await expect(page.getByText('Advanced Filters')).toBeVisible()
    
    // Check tabs work on mobile
    await page.getByText('Requests').click()
    await expect(page.getByText('Alice Johnson')).toBeVisible()
  })
})