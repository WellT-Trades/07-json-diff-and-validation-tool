from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from database import get_connection, initialize_database

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    """Check whether the API is running."""
    return jsonify({
        "message": "JSON Diff API is running"
    }), 200


@app.route("/comparisons", methods=["POST"])
def create_comparison():
    """Validate and save a comparison to SQLite."""
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Request body must be a valid JSON object."
        }), 400

    required_fields = [
        "title",
        "original_json",
        "updated_json",
        "changes"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"Missing required field: {field}"
            }), 400

    if not isinstance(data["title"], str) or not data["title"].strip():
        return jsonify({
            "error": "Title must be a non-empty string."
        }), 400

    try:
        original_json = (
            json.loads(data["original_json"])
            if isinstance(data["original_json"], str)
            else data["original_json"]
        )

        updated_json = (
            json.loads(data["updated_json"])
            if isinstance(data["updated_json"], str)
            else data["updated_json"]
        )

        changes = data["changes"]

        json.dumps(original_json)
        json.dumps(updated_json)
        changes_json = json.dumps(changes)

    except (ValueError, TypeError):
        return jsonify({
            "error": "Original JSON, updated JSON, or changes are invalid."
        }), 400

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO comparisons (
                title,
                original_json,
                updated_json,
                changes
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                data["title"].strip(),
                json.dumps(original_json),
                json.dumps(updated_json),
                changes_json
            )
        )

        comparison_id = cursor.lastrowid

    return jsonify({
        "message": "Comparison saved successfully.",
        "id": comparison_id
    }), 201


@app.route("/comparisons", methods=["GET"])
def get_comparisons():
    """Return all saved comparisons, newest first."""
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, title, created_at
            FROM comparisons
            ORDER BY id DESC
            """
        ).fetchall()

    comparisons = [dict(row) for row in rows]

    return jsonify(comparisons), 200


@app.route("/comparisons/<int:comparison_id>", methods=["GET"])
def get_comparison(comparison_id):
    """Return one saved comparison."""
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM comparisons
            WHERE id = ?
            """,
            (comparison_id,)
        ).fetchone()

    if row is None:
        return jsonify({
            "error": "Comparison not found."
        }), 404

    comparison = dict(row)

    comparison["original_json"] = json.loads(
        comparison["original_json"]
    )
    comparison["updated_json"] = json.loads(
        comparison["updated_json"]
    )
    comparison["changes"] = json.loads(
        comparison["changes"]
    )

    return jsonify(comparison), 200

if __name__ == "__main__":
    initialize_database()
    app.run(debug=True, port=5000)
